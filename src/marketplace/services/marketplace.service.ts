import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeolocationService } from '../../requests/services/geolocation.service';
import {
    CreateListingDto,
    UpdateListingDto,
    UpdateListingStatusDto,
    ListingQueryDto,
} from '../dto/listing.dto';
import { MarketplaceListingStatus } from '@prisma/client';

const LISTING_INCLUDE = {
    user: { select: { id: true, name: true, zipcode: true } },
    images: { orderBy: { sortOrder: 'asc' as const } },
    _count: { select: { savedBy: true } },
};

@Injectable()
export class MarketplaceService {
    constructor(
        private prisma: PrismaService,
        private geoService: GeolocationService,
    ) {}

    // ─── Listings ─────────────────────────────────────────────────────────────

    async create(userId: number, dto: CreateListingDto) {
        const { images, ...listingData } = dto;

        // Auto-resolve placeName from ZipCode table if not provided
        let placeName = dto.placeName;
        if (!placeName && dto.zipcode) {
            const zipData = await this.geoService.getZipCodeCoordinates(dto.zipcode);
            placeName = zipData?.placeName ?? dto.zipcode;
        }

        return this.prisma.marketplaceListing.create({
            data: {
                userId,
                ...listingData,
                placeName,
                images: images ? { create: images } : undefined,
            },
            include: LISTING_INCLUDE,
        });
    }

    async update(userId: number, listingId: number, dto: UpdateListingDto) {
        const listing = await this.ensureOwner(userId, listingId);

        if (listing.status !== MarketplaceListingStatus.ACTIVE) {
            throw new BadRequestException('Only active listings can be edited');
        }

        const { images, ...listingData } = dto;

        return this.prisma.marketplaceListing.update({
            where: { id: listingId },
            data: listingData,
            include: LISTING_INCLUDE,
        });
    }

    async delete(userId: number, listingId: number) {
        await this.ensureOwner(userId, listingId);
        return this.prisma.marketplaceListing.delete({ where: { id: listingId } });
    }

    async getOne(listingId: number) {
        const listing = await this.prisma.marketplaceListing.findUnique({
            where: { id: listingId },
            include: {
                ...LISTING_INCLUDE,
                savedBy: { select: { userId: true } },
            },
        });
        if (!listing || listing.status === MarketplaceListingStatus.REMOVED) {
            throw new NotFoundException('Listing not found');
        }
        return listing;
    }

    async browse(query: ListingQueryDto) {
        const {
            search, category, condition, zipcode, radiusKm = 50,
            minPrice, maxPrice, page = 1, limit = 20,
        } = query;
        const skip = (page - 1) * limit;

        // Geo filter
        let zipcodeFilter: string[] | undefined;
        if (zipcode) {
            const nearby = await this.geoService.findNearbyZipCodes(zipcode, radiusKm);
            zipcodeFilter = nearby.map(z => z.zipcode);
            if (zipcodeFilter.length === 0) return this.emptyPage(page, limit);
        }

        const where: any = {
            status: MarketplaceListingStatus.ACTIVE,
            ...(category && { category }),
            ...(condition && { condition }),
            ...(zipcodeFilter && { zipcode: { in: zipcodeFilter } }),
            ...(minPrice !== undefined || maxPrice !== undefined
                ? { price: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) } }
                : {}),
            ...(search && {
                OR: [
                    { title: { contains: search } },
                    { description: { contains: search } },
                ],
            }),
        };

        const [listings, total] = await Promise.all([
            this.prisma.marketplaceListing.findMany({
                where,
                skip,
                take: limit,
                include: LISTING_INCLUDE,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.marketplaceListing.count({ where }),
        ]);

        return {
            data: listings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        };
    }

    async updateStatus(userId: number, listingId: number, dto: UpdateListingStatusDto) {
        const listing = await this.ensureOwner(userId, listingId);

        if (listing.status === MarketplaceListingStatus.REMOVED) {
            throw new BadRequestException('Removed listings cannot be updated');
        }

        return this.prisma.marketplaceListing.update({
            where: { id: listingId },
            data: { status: dto.status },
            include: LISTING_INCLUDE,
        });
    }

    async getMyListings(userId: number, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [listings, total] = await Promise.all([
            this.prisma.marketplaceListing.findMany({
                where: { userId, status: { not: MarketplaceListingStatus.REMOVED } },
                skip,
                take: limit,
                include: LISTING_INCLUDE,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.marketplaceListing.count({
                where: { userId, status: { not: MarketplaceListingStatus.REMOVED } },
            }),
        ]);

        return {
            data: listings,
            pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: limit },
        };
    }

    // ─── Save / Bookmark ──────────────────────────────────────────────────────

    async saveListing(userId: number, listingId: number) {
        const listing = await this.prisma.marketplaceListing.findUnique({ where: { id: listingId } });
        if (!listing || listing.status !== MarketplaceListingStatus.ACTIVE) {
            throw new NotFoundException('Listing not found or not active');
        }

        if (listing.userId === userId) {
            throw new BadRequestException('You cannot save your own listing');
        }

        const existing = await this.prisma.marketplaceSavedListing.findUnique({
            where: { userId_listingId: { userId, listingId } },
        });
        if (existing) return { message: 'Already saved' };

        await this.prisma.marketplaceSavedListing.create({ data: { userId, listingId } });
        return { success: true, message: 'Listing saved' };
    }

    async unsaveListing(userId: number, listingId: number) {
        const record = await this.prisma.marketplaceSavedListing.findUnique({
            where: { userId_listingId: { userId, listingId } },
        });
        if (!record) throw new NotFoundException('Saved listing not found');

        await this.prisma.marketplaceSavedListing.delete({
            where: { userId_listingId: { userId, listingId } },
        });
        return { success: true, message: 'Listing unsaved' };
    }

    async getSavedListings(userId: number, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [saved, total] = await Promise.all([
            this.prisma.marketplaceSavedListing.findMany({
                where: { userId },
                skip,
                take: limit,
                include: {
                    listing: {
                        include: LISTING_INCLUDE,
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.marketplaceSavedListing.count({ where: { userId } }),
        ]);

        return {
            data: saved.map(s => s.listing),
            pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: limit },
        };
    }

    // ─── Images ───────────────────────────────────────────────────────────────

    async addImages(userId: number, listingId: number, images: { url: string; isPrimary?: boolean; sortOrder?: number }[]) {
        await this.ensureOwner(userId, listingId);
        return this.prisma.marketplaceImage.createMany({
            data: images.map(img => ({ listingId, ...img })),
        });
    }

    async deleteImage(userId: number, imageId: number) {
        const image = await this.prisma.marketplaceImage.findUnique({ where: { id: imageId } });
        if (!image) throw new NotFoundException('Image not found');
        await this.ensureOwner(userId, image.listingId);
        return this.prisma.marketplaceImage.delete({ where: { id: imageId } });
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    async adminRemoveListing(listingId: number) {
        const listing = await this.prisma.marketplaceListing.findUnique({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');

        return this.prisma.marketplaceListing.update({
            where: { id: listingId },
            data: { status: MarketplaceListingStatus.REMOVED },
        });
    }

    async adminGetAllListings(query: ListingQueryDto & { status?: MarketplaceListingStatus }) {
        const { page = 1, limit = 20, status, category, search } = query as any;
        const skip = (page - 1) * limit;

        const where: any = {
            ...(status && { status }),
            ...(category && { category }),
            ...(search && {
                OR: [{ title: { contains: search } }, { description: { contains: search } }],
            }),
        };

        const [listings, total] = await Promise.all([
            this.prisma.marketplaceListing.findMany({
                where,
                skip,
                take: limit,
                include: LISTING_INCLUDE,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.marketplaceListing.count({ where }),
        ]);

        return {
            data: listings,
            pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total, itemsPerPage: limit },
        };
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private async ensureOwner(userId: number, listingId: number) {
        const listing = await this.prisma.marketplaceListing.findUnique({ where: { id: listingId } });
        if (!listing) throw new NotFoundException('Listing not found');
        if (listing.userId !== userId) throw new ForbiddenException('You do not own this listing');
        return listing;
    }

    private emptyPage(page: number, limit: number) {
        return {
            data: [],
            pagination: { currentPage: page, totalPages: 0, totalItems: 0, itemsPerPage: limit, hasNextPage: false, hasPreviousPage: false },
        };
    }
}
