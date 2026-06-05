import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GeolocationService } from "../../requests/services/geolocation.service";
import {
  CreateListingDto,
  UpdateListingDto,
  UpdateListingStatusDto,
  ListingQueryDto,
} from "../dto/listing.dto";
import { MarketplaceListingStatus } from "@prisma/client";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely JSON-parse a string; returns the fallback on failure. */
function tryParseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Deserialize JSON-stored array fields on a raw listing from Prisma. */
function deserializeListingArrays(listing: any) {
  if (!listing) return listing;
  return {
    ...listing,
    materials: tryParseJson<string[]>(listing.materials, []),
    colors: tryParseJson<string[]>(listing.colors, []),
    boxContains: tryParseJson<string[]>(listing.boxContains, []),
  };
}

/** Attach poster meta (lastWsConnectedAt, totalListingsCount) and optional distance. */
function enrichListing(listing: any, distanceKm?: number | null) {
  const deserialized = deserializeListingArrays(listing);
  const user = deserialized.user ?? {};

  return {
    ...deserialized,
    user: {
      ...user,
      totalListingsCount: user._count?.marketplaceListings ?? null,
      _count: undefined,
    },
    ...(distanceKm !== undefined && distanceKm !== null
      ? { distanceKm }
      : {}),
  };
}

// ─── Prisma include ───────────────────────────────────────────────────────────

const LISTING_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      zipcode: true,
      lastWsConnectedAt: true,
      _count: { select: { marketplaceListings: true } },
    },
  },
  images: { orderBy: { sortOrder: "asc" as const } },
  _count: { select: { savedBy: true } },
};

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private geoService: GeolocationService,
  ) {}

  // ─── Listings ─────────────────────────────────────────────────────────────

  private normalizeImagesInput(images: unknown) {
    if (!Array.isArray(images)) return undefined;

    const normalized = images
      .map((img: any) => {
        if (typeof img === "string") {
          return { url: img };
        }

        if (!img || typeof img !== "object") return null;
        if (typeof img.url !== "string" || img.url.trim() === "") return null;

        const sortOrderNumber =
          img.sortOrder === undefined ||
          img.sortOrder === null ||
          img.sortOrder === ""
            ? undefined
            : Number(img.sortOrder);

        const isPrimaryValue =
          img.isPrimary === "true"
            ? true
            : img.isPrimary === "false"
              ? false
              : img.isPrimary;

        return {
          url: img.url,
          ...(typeof isPrimaryValue === "boolean"
            ? { isPrimary: isPrimaryValue }
            : {}),
          ...(Number.isFinite(sortOrderNumber)
            ? { sortOrder: Math.floor(sortOrderNumber) }
            : {}),
        };
      })
      .filter(Boolean);

    return normalized as {
      url: string;
      isPrimary?: boolean;
      sortOrder?: number;
    }[];
  }

  /** Serialize array fields to JSON strings for MySQL storage. */
  private serializeArrayFields(dto: Partial<CreateListingDto>) {
    return {
      ...(dto.materials !== undefined && {
        materials: JSON.stringify(dto.materials),
      }),
      ...(dto.colors !== undefined && {
        colors: JSON.stringify(dto.colors),
      }),
      ...(dto.boxContains !== undefined && {
        boxContains: JSON.stringify(dto.boxContains),
      }),
    };
  }

  async create(userId: number, dto: CreateListingDto) {
    const { images, materials, colors, boxContains, ...listingData } = dto;
    const normalizedImages = this.normalizeImagesInput(images);

    // Auto-resolve placeName from ZipCode table if not provided
    let placeName = dto.placeName;
    if (!placeName && dto.zipcode) {
      const zipData = await this.geoService.getZipCodeCoordinates(dto.zipcode);
      placeName = zipData?.placeName ?? dto.zipcode;
    }

    const raw = await this.prisma.marketplaceListing.create({
      data: {
        userId,
        ...listingData,
        placeName,
        // Serialize array fields
        ...(materials !== undefined && { materials: JSON.stringify(materials) }),
        ...(colors !== undefined && { colors: JSON.stringify(colors) }),
        ...(boxContains !== undefined && {
          boxContains: JSON.stringify(boxContains),
        }),
        images: normalizedImages ? { create: normalizedImages } : undefined,
      },
      include: LISTING_INCLUDE,
    });
    return enrichListing(raw);
  }

  async update(userId: number, listingId: number, dto: UpdateListingDto) {
    const listing = await this.ensureOwner(userId, listingId);

    if (listing.status === MarketplaceListingStatus.REMOVED) {
      throw new BadRequestException("Removed listings cannot be edited");
    }

    if (listing.status === MarketplaceListingStatus.SOLD) {
      throw new BadRequestException("Sold listings cannot be edited");
    }

    const { images, materials, colors, boxContains, ...listingData } = dto;
    const normalizedImages = this.normalizeImagesInput(images);

    // Auto-resolve placeName if zipcode is updated and placeName not provided
    let resolvedPlaceName: string | undefined;
    if (!dto.placeName && dto.zipcode) {
      const zipData = await this.geoService.getZipCodeCoordinates(dto.zipcode);
      resolvedPlaceName = zipData?.placeName ?? dto.zipcode;
    }

    const imagesUpdate =
      images !== undefined
        ? {
            deleteMany: {},
            ...(normalizedImages && normalizedImages.length > 0
              ? { create: normalizedImages }
              : {}),
          }
        : undefined;

    const raw = await this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: {
        ...listingData,
        ...(resolvedPlaceName !== undefined
          ? { placeName: resolvedPlaceName }
          : {}),
        ...(imagesUpdate !== undefined ? { images: imagesUpdate } : {}),
        // Serialize array fields only when explicitly provided
        ...(materials !== undefined && { materials: JSON.stringify(materials) }),
        ...(colors !== undefined && { colors: JSON.stringify(colors) }),
        ...(boxContains !== undefined && {
          boxContains: JSON.stringify(boxContains),
        }),
      },
      include: LISTING_INCLUDE,
    });
    return enrichListing(raw);
  }

  async delete(userId: number, listingId: number) {
    await this.ensureOwner(userId, listingId);
    return this.prisma.marketplaceListing.delete({ where: { id: listingId } });
  }

  async getOne(listingId: number, queryZipcode?: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: {
        ...LISTING_INCLUDE,
        savedBy: { select: { userId: true } },
      },
    });
    if (!listing || listing.status === MarketplaceListingStatus.REMOVED) {
      throw new NotFoundException("Listing not found");
    }

    // Compute straight-line distance if a query zipcode is provided
    let distanceKm: number | null = null;
    if (queryZipcode && listing.zipcode) {
      distanceKm = await this.computeDistance(queryZipcode, listing.zipcode);
    }

    return enrichListing(listing, distanceKm);
  }

  async browse(query: ListingQueryDto) {
    const {
      search,
      category,
      condition,
      zipcode,
      radiusKm = 50,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = query;
    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = this.normalizePagination(page, limit);

    // Geo filter – also build a lookup map of zipcode → coordinates for distance
    let zipcodeFilter: string[] | undefined;
    let zipCoordMap: Map<string, { lat: number; lon: number }> = new Map();
    let queryCoords: { lat: number; lon: number } | null = null;

    if (zipcode) {
      const nearby = await this.geoService.findNearbyZipCodes(zipcode, radiusKm);
      zipcodeFilter = nearby.map((z) => z.zipcode);
      if (zipcodeFilter.length === 0)
        return this.emptyPage(safePage, safeLimit);

      // Build coord map for distance calculation
      for (const z of nearby) {
        zipCoordMap.set(z.zipcode, { lat: z.latitude, lon: z.longitude });
      }
      // Get query zipcode coords for distance
      const qc = await this.geoService.getZipCodeCoordinates(zipcode, {
        allowExternalLookup: false,
      });
      if (qc) {
        queryCoords = { lat: qc.latitude, lon: qc.longitude };
      }
    }

    const where: any = {
      status: MarketplaceListingStatus.ACTIVE,
      ...(category && { category }),
      ...(condition && { condition }),
      ...(zipcodeFilter && { zipcode: { in: zipcodeFilter } }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
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
        take: safeLimit,
        include: LISTING_INCLUDE,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.marketplaceListing.count({ where }),
    ]);

    // Attach distance & deserialize array fields
    const enriched = listings.map((listing) => {
      let distanceKm: number | null = null;
      if (queryCoords && listing.zipcode) {
        const listingCoords = zipCoordMap.get(listing.zipcode);
        if (listingCoords) {
          distanceKm = this.geoService.calculateDistance(
            queryCoords.lat,
            queryCoords.lon,
            listingCoords.lat,
            listingCoords.lon,
          );
        }
      }
      return enrichListing(listing, distanceKm);
    });

    return {
      data: enriched,
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
        totalItems: total,
        itemsPerPage: safeLimit,
        hasNextPage: safePage < Math.ceil(total / safeLimit),
        hasPreviousPage: safePage > 1,
      },
    };
  }

  async updateStatus(
    userId: number,
    listingId: number,
    dto: UpdateListingStatusDto,
  ) {
    const listing = await this.ensureOwner(userId, listingId);

    if (listing.status === MarketplaceListingStatus.REMOVED) {
      throw new BadRequestException("Removed listings cannot be updated");
    }

    return this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { status: dto.status },
      include: LISTING_INCLUDE,
    });
  }

  async getMyListings(userId: number, page = 1, limit = 20) {
    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = this.normalizePagination(page, limit);
    const [listings, total] = await Promise.all([
      this.prisma.marketplaceListing.findMany({
        where: { userId, status: { not: MarketplaceListingStatus.REMOVED } },
        skip,
        take: safeLimit,
        include: LISTING_INCLUDE,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.marketplaceListing.count({
        where: { userId, status: { not: MarketplaceListingStatus.REMOVED } },
      }),
    ]);

    return {
      data: listings.map((l) => enrichListing(l)),
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
        totalItems: total,
        itemsPerPage: safeLimit,
      },
    };
  }

  // ─── Save / Bookmark ──────────────────────────────────────────────────────

  async saveListing(userId: number, listingId: number) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });
    if (!listing || listing.status !== MarketplaceListingStatus.ACTIVE) {
      throw new NotFoundException("Listing not found or not active");
    }

    if (listing.userId === userId) {
      throw new BadRequestException("You cannot save your own listing");
    }

    const existing = await this.prisma.marketplaceSavedListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (existing) return { message: "Already saved" };

    await this.prisma.marketplaceSavedListing.create({
      data: { userId, listingId },
    });
    return { success: true, message: "Listing saved" };
  }

  async unsaveListing(userId: number, listingId: number) {
    const record = await this.prisma.marketplaceSavedListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (!record) throw new NotFoundException("Saved listing not found");

    await this.prisma.marketplaceSavedListing.delete({
      where: { userId_listingId: { userId, listingId } },
    });
    return { success: true, message: "Listing unsaved" };
  }

  async getSavedListings(userId: number, page = 1, limit = 20) {
    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = this.normalizePagination(page, limit);
    const [saved, total] = await Promise.all([
      this.prisma.marketplaceSavedListing.findMany({
        where: { userId },
        skip,
        take: safeLimit,
        include: {
          listing: {
            include: LISTING_INCLUDE,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.marketplaceSavedListing.count({ where: { userId } }),
    ]);

    return {
      data: saved.map((s) => enrichListing(s.listing)),
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
        totalItems: total,
        itemsPerPage: safeLimit,
      },
    };
  }

  // ─── Images ───────────────────────────────────────────────────────────────

  async addImages(
    userId: number,
    listingId: number,
    images: { url: string; isPrimary?: boolean; sortOrder?: number }[],
  ) {
    await this.ensureOwner(userId, listingId);
    return this.prisma.marketplaceImage.createMany({
      data: images.map((img) => ({ listingId, ...img })),
    });
  }

  async deleteImage(userId: number, imageId: number) {
    const image = await this.prisma.marketplaceImage.findUnique({
      where: { id: imageId },
    });
    if (!image) throw new NotFoundException("Image not found");
    await this.ensureOwner(userId, image.listingId);
    return this.prisma.marketplaceImage.delete({ where: { id: imageId } });
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async adminRemoveListing(listingId: number) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException("Listing not found");

    return this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { status: MarketplaceListingStatus.REMOVED },
    });
  }

  async adminGetAllListings(
    query: ListingQueryDto & { status?: MarketplaceListingStatus },
  ) {
    const { page = 1, limit = 20, status, category, search } = query as any;
    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = this.normalizePagination(page, limit);

    const where: any = {
      ...(status && { status }),
      ...(category && { category }),
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
        take: safeLimit,
        include: LISTING_INCLUDE,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.marketplaceListing.count({ where }),
    ]);

    return {
      data: listings.map((l) => enrichListing(l)),
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(total / safeLimit),
        totalItems: total,
        itemsPerPage: safeLimit,
      },
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async ensureOwner(userId: number, listingId: number) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.userId !== userId)
      throw new ForbiddenException("You do not own this listing");
    return listing;
  }

  /**
   * Compute straight-line (Haversine) distance in km between two zipcodes
   * using the ZipCode table. Returns null if either zipcode is not found.
   */
  private async computeDistance(
    fromZipcode: string,
    toZipcode: string,
  ): Promise<number | null> {
    if (!fromZipcode || !toZipcode || fromZipcode === toZipcode) return null;

    const [from, to] = await Promise.all([
      this.geoService.getZipCodeCoordinates(fromZipcode, {
        allowExternalLookup: false,
      }),
      this.geoService.getZipCodeCoordinates(toZipcode, {
        allowExternalLookup: false,
      }),
    ]);

    if (!from || !to) return null;

    return this.geoService.calculateDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
    );
  }

  private emptyPage(page: number, limit: number) {
    return {
      data: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  private normalizePagination(pageInput: unknown, limitInput: unknown) {
    const defaultPage = 1;
    const defaultLimit = 20;
    const maxLimit = 100;

    const pageNumber = Number(pageInput);
    const limitNumber = Number(limitInput);

    const page =
      Number.isFinite(pageNumber) && pageNumber > 0
        ? Math.floor(pageNumber)
        : defaultPage;
    const limitRaw =
      Number.isFinite(limitNumber) && limitNumber > 0
        ? Math.floor(limitNumber)
        : defaultLimit;
    const limit = Math.min(limitRaw, maxLimit);

    return { page, limit, skip: (page - 1) * limit };
  }
}
