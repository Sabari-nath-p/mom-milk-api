import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Request,
  UseGuards,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { EcomReviewsService } from "../services/ecom-reviews.service";
import { CreateReviewDto, CreateReviewReplyDto } from "../dto/review.dto";

@ApiTags("E-Commerce / Reviews")
@Controller("ecom/products/:productId/reviews")
export class EcomReviewsController {
  constructor(private readonly reviewsService: EcomReviewsService) {}

  @Get()
  @ApiOperation({
    summary: "List reviews for a product (verified purchases shown first)",
  })
  @ApiParam({ name: "productId", type: Number })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getReviews(
    @Param("productId", ParseIntPipe) productId: number,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.reviewsService.getProductReviews(productId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({
    summary:
      "Leave a review for a product (provide orderId for verified purchase badge)",
  })
  @ApiParam({ name: "productId", type: Number })
  createReview(
    @Request() req,
    @Param("productId", ParseIntPipe) productId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.id, productId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(":reviewId/replies")
  @ApiOperation({ summary: "Reply to a review" })
  @ApiParam({ name: "productId", type: Number })
  @ApiParam({ name: "reviewId", type: Number })
  replyToReview(
    @Request() req,
    @Param("reviewId", ParseIntPipe) reviewId: number,
    @Body() dto: CreateReviewReplyDto,
  ) {
    return this.reviewsService.reply(req.user.id, reviewId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":reviewId/replies/:replyId")
  @ApiOperation({ summary: "Delete your reply to a review" })
  @ApiParam({ name: "productId", type: Number })
  @ApiParam({ name: "reviewId", type: Number })
  @ApiParam({ name: "replyId", type: Number })
  deleteReply(@Request() req, @Param("replyId", ParseIntPipe) replyId: number) {
    return this.reviewsService.deleteReply(req.user.id, replyId, false);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Delete("admin/:reviewId/hide")
  @ApiOperation({ summary: "[Admin] Hide a review" })
  @ApiParam({ name: "productId", type: Number })
  @ApiParam({ name: "reviewId", type: Number })
  hideReview(@Param("reviewId", ParseIntPipe) reviewId: number) {
    return this.reviewsService.adminHideReview(reviewId, true);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Post("admin/:reviewId/unhide")
  @ApiOperation({ summary: "[Admin] Unhide a review" })
  @ApiParam({ name: "productId", type: Number })
  @ApiParam({ name: "reviewId", type: Number })
  unhideReview(@Param("reviewId", ParseIntPipe) reviewId: number) {
    return this.reviewsService.adminHideReview(reviewId, false);
  }
}
