import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto, CreateReviewReplyDto } from '../dto/review.dto';

@Injectable()
export class EcomReviewsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: number, productId: number, dto: CreateReviewDto) {
        // Check product exists
        const product = await this.prisma.ecomProduct.findFirst({
            where: { id: productId, isActive: true },
        });
        if (!product) throw new NotFoundException('Product not found');

        // One review per user per product
        const existing = await this.prisma.ecomReview.findFirst({
            where: { productId, userId },
        });
        if (existing) throw new ConflictException('You have already reviewed this product');

        // Check verified purchase
        let isVerifiedPurchase = false;
        if (dto.orderId) {
            const orderItem = await this.prisma.ecomOrderItem.findFirst({
                where: {
                    orderId: dto.orderId,
                    productId,
                    order: { userId },
                },
            });
            isVerifiedPurchase = !!orderItem;
        }

        const review = await this.prisma.ecomReview.create({
            data: {
                productId,
                userId,
                orderId: dto.orderId ?? null,
                rating: dto.rating,
                title: dto.title,
                body: dto.body,
                images: dto.images,
                isVerifiedPurchase,
            },
            include: {
                user: { select: { id: true, name: true } },
                replies: { include: { user: { select: { id: true, name: true } } } },
            },
        });

        // Update product average rating
        await this.recalculateRating(productId);

        return review;
    }

    async getProductReviews(productId: number, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            this.prisma.ecomReview.findMany({
                where: { productId, isHidden: false },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true } },
                    replies: {
                        include: { user: { select: { id: true, name: true } } },
                        orderBy: { createdAt: 'asc' },
                    },
                },
                orderBy: [{ isVerifiedPurchase: 'desc' }, { createdAt: 'desc' }],
            }),
            this.prisma.ecomReview.count({ where: { productId, isHidden: false } }),
        ]);

        return {
            data: reviews,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit,
            },
        };
    }

    async reply(userId: number, reviewId: number, dto: CreateReviewReplyDto) {
        const review = await this.prisma.ecomReview.findUnique({
            where: { id: reviewId },
        });
        if (!review) throw new NotFoundException('Review not found');

        return this.prisma.ecomReviewReply.create({
            data: {
                reviewId,
                userId,
                body: dto.body,
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });
    }

    async deleteReply(userId: number, replyId: number, isAdmin = false) {
        const reply = await this.prisma.ecomReviewReply.findUnique({ where: { id: replyId } });
        if (!reply) throw new NotFoundException('Reply not found');

        if (!isAdmin && reply.userId !== userId) {
            throw new ForbiddenException('You can only delete your own replies');
        }

        return this.prisma.ecomReviewReply.delete({ where: { id: replyId } });
    }

    async adminHideReview(reviewId: number, hide: boolean) {
        const review = await this.prisma.ecomReview.findUnique({ where: { id: reviewId } });
        if (!review) throw new NotFoundException('Review not found');

        const updated = await this.prisma.ecomReview.update({
            where: { id: reviewId },
            data: { isHidden: hide },
        });

        await this.recalculateRating(review.productId);
        return updated;
    }

    private async recalculateRating(productId: number) {
        const result = await this.prisma.ecomReview.aggregate({
            where: { productId, isHidden: false },
            _avg: { rating: true },
            _count: { rating: true },
        });

        await this.prisma.ecomProduct.update({
            where: { id: productId },
            data: {
                averageRating: result._avg.rating ?? 0,
                totalReviews: result._count.rating,
            },
        });
    }
}
