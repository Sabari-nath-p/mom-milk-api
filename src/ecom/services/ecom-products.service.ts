import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeolocationService } from '../../requests/services/geolocation.service';
import {
    CreateProductDto,
    UpdateProductDto,
    ProductQueryDto,
    CreateVariantDto,
    UpdateVariantDto,
    CreateCategoryDto,
    UpdateCategoryDto,
} from '../dto/product.dto';
import { VendorService } from './vendor.service';

const PRODUCT_INCLUDE = {
    vendor: {
        select: { id: true, storeName: true, logoUrl: true, zipcode: true, isVerified: true },
    },
    category: { select: { id: true, name: true } },
    images: { orderBy: { sortOrder: 'asc' as const } },
    variants: { where: { isActive: true }, orderBy: { id: 'asc' as const } },
    _count: { select: { reviews: true } },
};

@Injectable()
export class EcomProductsService {
    constructor(
        private prisma: PrismaService,
        private geoService: GeolocationService,
        private vendorService: VendorService,
    ) {}

    // ─── Categories (Admin) ───────────────────────────────────────────────────

    async createCategory(dto: CreateCategoryDto) {
        return this.prisma.ecomCategory.create({ data: dto });
    }

    async updateCategory(id: number, dto: UpdateCategoryDto) {
        const cat = await this.prisma.ecomCategory.findUnique({ where: { id } });
        if (!cat) throw new NotFoundException('Category not found');
        return this.prisma.ecomCategory.update({ where: { id }, data: dto });
    }

    async deleteCategory(id: number) {
        const cat = await this.prisma.ecomCategory.findUnique({ where: { id } });
        if (!cat) throw new NotFoundException('Category not found');
        return this.prisma.ecomCategory.delete({ where: { id } });
    }

    async listCategories() {
        return this.prisma.ecomCategory.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }

    // ─── Products ─────────────────────────────────────────────────────────────

    async create(userId: number, dto: CreateProductDto) {
        const vendor = await this.vendorService.getVendorByUserId(userId);
        if (!vendor) throw new ForbiddenException('You must have a vendor profile to create products');
        if (!vendor.isActive) throw new ForbiddenException('Your vendor account is inactive');

        const { images, variants, ...productData } = dto;

        return this.prisma.ecomProduct.create({
            data: {
                ...productData,
                vendorId: vendor.id,
                zipcode: vendor.zipcode,
                images: images
                    ? { create: images }
                    : undefined,
                variants: variants && dto.hasVariants
                    ? { create: variants }
                    : undefined,
            },
            include: PRODUCT_INCLUDE,
        });
    }

    async update(userId: number, productId: number, dto: UpdateProductDto) {
        await this.vendorService.ensureVendorOwnsProduct(userId, productId);

        const { images, variants, ...productData } = dto;

        return this.prisma.ecomProduct.update({
            where: { id: productId },
            data: productData,
            include: PRODUCT_INCLUDE,
        });
    }

    async delete(userId: number, productId: number) {
        await this.vendorService.ensureVendorOwnsProduct(userId, productId);
        return this.prisma.ecomProduct.delete({ where: { id: productId } });
    }

    async findOne(id: number) {
        const product = await this.prisma.ecomProduct.findUnique({
            where: { id },
            include: {
                ...PRODUCT_INCLUDE,
                reviews: {
                    where: { isHidden: false },
                    include: {
                        user: { select: { id: true, name: true } },
                        replies: {
                            include: { user: { select: { id: true, name: true } } },
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
        if (!product || !product.isActive)
            throw new NotFoundException('Product not found');
        return product;
    }

    async findAll(query: ProductQueryDto) {
        const { search, categoryId, vendorId, zipcode, radiusKm = 50, minPrice, maxPrice, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        // Build location filter
        let zipcodeFilter: string[] | undefined;
        if (zipcode) {
            const nearby = await this.geoService.findNearbyZipCodes(zipcode, radiusKm);
            zipcodeFilter = nearby.map(z => z.zipcode);
            if (zipcodeFilter.length === 0) return this.emptyPage(page, limit);
        }

        const where: any = {
            isActive: true,
            ...(categoryId && { categoryId }),
            ...(vendorId && { vendorId }),
            ...(zipcodeFilter && { zipcode: { in: zipcodeFilter } }),
            ...(minPrice !== undefined || maxPrice !== undefined
                ? { basePrice: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) } }
                : {}),
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } },
                    { tags: { contains: search } },
                ],
            }),
        };

        const [products, total] = await Promise.all([
            this.prisma.ecomProduct.findMany({
                where,
                skip,
                take: limit,
                include: PRODUCT_INCLUDE,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.ecomProduct.count({ where }),
        ]);

        return {
            data: products,
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

    // ─── Variants ─────────────────────────────────────────────────────────────

    async addVariant(userId: number, productId: number, dto: CreateVariantDto) {
        const { product } = await this.vendorService.ensureVendorOwnsProduct(userId, productId);
        if (!product.hasVariants)
            throw new BadRequestException('This product does not support variants. Set hasVariants=true first.');

        return this.prisma.ecomProductVariant.create({
            data: { productId, ...dto },
        });
    }

    async updateVariant(userId: number, productId: number, variantId: number, dto: UpdateVariantDto) {
        await this.vendorService.ensureVendorOwnsProduct(userId, productId);
        const variant = await this.prisma.ecomProductVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant) throw new NotFoundException('Variant not found');

        return this.prisma.ecomProductVariant.update({
            where: { id: variantId },
            data: dto,
        });
    }

    async deleteVariant(userId: number, productId: number, variantId: number) {
        await this.vendorService.ensureVendorOwnsProduct(userId, productId);
        const variant = await this.prisma.ecomProductVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant) throw new NotFoundException('Variant not found');

        return this.prisma.ecomProductVariant.delete({ where: { id: variantId } });
    }

    // ─── Vendor's own products ────────────────────────────────────────────────

    async getMyProducts(userId: number, page = 1, limit = 20) {
        const vendor = await this.vendorService.getVendorByUserId(userId);
        if (!vendor) throw new NotFoundException('Vendor profile not found');

        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.prisma.ecomProduct.findMany({
                where: { vendorId: vendor.id },
                skip,
                take: limit,
                include: PRODUCT_INCLUDE,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.ecomProduct.count({ where: { vendorId: vendor.id } }),
        ]);

        return {
            data: products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }

    // ─── Images ───────────────────────────────────────────────────────────────

    async addImages(userId: number, productId: number, images: { url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }[]) {
        await this.vendorService.ensureVendorOwnsProduct(userId, productId);
        return this.prisma.ecomProductImage.createMany({
            data: images.map(img => ({ productId, ...img })),
        });
    }

    async deleteImage(userId: number, imageId: number) {
        const image = await this.prisma.ecomProductImage.findUnique({ where: { id: imageId } });
        if (!image) throw new NotFoundException('Image not found');
        await this.vendorService.ensureVendorOwnsProduct(userId, image.productId);
        return this.prisma.ecomProductImage.delete({ where: { id: imageId } });
    }

    private emptyPage(page: number, limit: number) {
        return {
            data: [],
            pagination: { currentPage: page, totalPages: 0, totalItems: 0, itemsPerPage: limit, hasNextPage: false, hasPreviousPage: false },
        };
    }
}
