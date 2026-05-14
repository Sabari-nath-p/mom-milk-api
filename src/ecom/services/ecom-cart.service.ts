import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';

@Injectable()
export class EcomCartService {
    constructor(private prisma: PrismaService) {}

    private async getOrCreateCart(userId: number) {
        let cart = await this.prisma.ecomCart.findUnique({
            where: { userId },
        });
        if (!cart) {
            cart = await this.prisma.ecomCart.create({ data: { userId } });
        }
        return cart;
    }

    async getCart(userId: number) {
        const cart = await this.prisma.ecomCart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: { where: { isPrimary: true }, take: 1 },
                                vendor: { select: { id: true, storeName: true } },
                            },
                        },
                        variant: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });

        if (!cart) return { items: [], total: 0 };

        const total = cart.items.reduce((sum, item) => {
            const price = item.variant ? item.variant.price : item.product.basePrice;
            return sum + price * item.quantity;
        }, 0);

        return { ...cart, total };
    }

    async addItem(userId: number, dto: AddToCartDto) {
        const cart = await this.getOrCreateCart(userId);

        // Validate product
        const product = await this.prisma.ecomProduct.findFirst({
            where: { id: dto.productId, isActive: true },
        });
        if (!product) throw new NotFoundException('Product not found or inactive');

        // Validate variant if product has variants
        if (product.hasVariants && !dto.variantId) {
            throw new BadRequestException('This product requires a variant selection');
        }

        if (dto.variantId) {
            const variant = await this.prisma.ecomProductVariant.findFirst({
                where: { id: dto.variantId, productId: dto.productId, isActive: true },
            });
            if (!variant) throw new NotFoundException('Variant not found or inactive');

            const available = product.hasVariants ? variant.stock : product.stock;
            if (available < dto.quantity) {
                throw new BadRequestException(`Only ${available} units available in stock`);
            }
        } else {
            if (product.stock < dto.quantity) {
                throw new BadRequestException(`Only ${product.stock} units available in stock`);
            }
        }

        // Upsert cart item
        const existingItem = await this.prisma.ecomCartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: dto.productId,
                variantId: dto.variantId ?? null,
            },
        });

        if (existingItem) {
            return this.prisma.ecomCartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity },
            });
        }

        return this.prisma.ecomCartItem.create({
            data: {
                cartId: cart.id,
                productId: dto.productId,
                variantId: dto.variantId ?? null,
                quantity: dto.quantity,
            },
        });
    }

    async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
        const cart = await this.prisma.ecomCart.findUnique({ where: { userId } });
        if (!cart) throw new NotFoundException('Cart not found');

        const item = await this.prisma.ecomCartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item) throw new NotFoundException('Cart item not found');

        if (dto.quantity === 0) {
            return this.prisma.ecomCartItem.delete({ where: { id: itemId } });
        }

        return this.prisma.ecomCartItem.update({
            where: { id: itemId },
            data: { quantity: dto.quantity },
        });
    }

    async removeItem(userId: number, itemId: number) {
        const cart = await this.prisma.ecomCart.findUnique({ where: { userId } });
        if (!cart) throw new NotFoundException('Cart not found');

        const item = await this.prisma.ecomCartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item) throw new NotFoundException('Cart item not found');

        return this.prisma.ecomCartItem.delete({ where: { id: itemId } });
    }

    async clearCart(userId: number) {
        const cart = await this.prisma.ecomCart.findUnique({ where: { userId } });
        if (!cart) return { deleted: 0 };

        const result = await this.prisma.ecomCartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return { deleted: result.count };
    }

    async getCartItems(userId: number) {
        const cart = await this.prisma.ecomCart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
            },
        });
        return cart?.items ?? [];
    }
}
