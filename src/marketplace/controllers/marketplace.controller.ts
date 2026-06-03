import {
  Controller,
  Post,
  Get,
  Patch,
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
import { MarketplaceService } from "../services/marketplace.service";
import {
  CreateListingDto,
  UpdateListingDto,
  UpdateListingStatusDto,
  ListingQueryDto,
} from "../dto/listing.dto";
import { MarketplaceImageDto } from "../dto/listing.dto";

@ApiTags("Marketplace")
@Controller("marketplace")
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  private parsePositiveInt(value: unknown, fallback: number) {
    if (value === undefined || value === null || value === "") return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    const intValue = Math.floor(parsed);
    return intValue > 0 ? intValue : fallback;
  }

  // ─── Public: Browse ───────────────────────────────────────────────────────

  @Get("listings")
  @ApiOperation({
    summary:
      "Browse active marketplace listings (filter by category, condition, location)",
  })
  browse(@Query() query: ListingQueryDto) {
    return this.marketplaceService.browse(query);
  }

  @Get("listings/:id")
  @ApiOperation({ summary: "Get marketplace listing detail" })
  @ApiParam({ name: "id", type: Number })
  getOne(@Param("id", ParseIntPipe) id: number) {
    return this.marketplaceService.getOne(id);
  }

  // ─── Authenticated: Create & Manage own listings ──────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("listings")
  @ApiOperation({ summary: "Create a marketplace listing" })
  create(@Request() req, @Body() dto: CreateListingDto) {
    return this.marketplaceService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch("listings/:id")
  @ApiOperation({ summary: "Update your listing" })
  @ApiParam({ name: "id", type: Number })
  update(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateListingDto,
  ) {
    return this.marketplaceService.update(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete("listings/:id")
  @ApiOperation({ summary: "Delete your listing" })
  @ApiParam({ name: "id", type: Number })
  delete(@Request() req, @Param("id", ParseIntPipe) id: number) {
    return this.marketplaceService.delete(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch("listings/:id/status")
  @ApiOperation({ summary: "Update listing status (ACTIVE, SOLD, EXPIRED)" })
  @ApiParam({ name: "id", type: Number })
  updateStatus(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateListingStatusDto,
  ) {
    return this.marketplaceService.updateStatus(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("my-listings")
  @ApiOperation({ summary: "Get my listings" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getMyListings(
    @Request() req,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.marketplaceService.getMyListings(
      req.user.id,
      this.parsePositiveInt(page, 1),
      this.parsePositiveInt(limit, 20),
    );
  }

  // ─── Images ───────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("listings/:id/images")
  @ApiOperation({ summary: "Add images to a listing" })
  @ApiParam({ name: "id", type: Number })
  addImages(
    @Request() req,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { images: MarketplaceImageDto[] },
  ) {
    return this.marketplaceService.addImages(req.user.id, id, body.images);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete("images/:imageId")
  @ApiOperation({ summary: "Delete an image from your listing" })
  @ApiParam({ name: "imageId", type: Number })
  deleteImage(@Request() req, @Param("imageId", ParseIntPipe) imageId: number) {
    return this.marketplaceService.deleteImage(req.user.id, imageId);
  }

  // ─── Save / Bookmark ──────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("listings/:id/save")
  @ApiOperation({ summary: "Save/bookmark a listing" })
  @ApiParam({ name: "id", type: Number })
  saveListing(@Request() req, @Param("id", ParseIntPipe) id: number) {
    return this.marketplaceService.saveListing(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete("listings/:id/save")
  @ApiOperation({ summary: "Unsave/unbookmark a listing" })
  @ApiParam({ name: "id", type: Number })
  unsaveListing(@Request() req, @Param("id", ParseIntPipe) id: number) {
    return this.marketplaceService.unsaveListing(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("saved")
  @ApiOperation({ summary: "Get my saved listings" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getSaved(
    @Request() req,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.marketplaceService.getSavedListings(
      req.user.id,
      this.parsePositiveInt(page, 1),
      this.parsePositiveInt(limit, 20),
    );
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Get("admin/listings")
  @ApiOperation({ summary: "[Admin] List all marketplace listings" })
  adminGetAll(@Query() query: ListingQueryDto) {
    return this.marketplaceService.adminGetAllListings(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Patch("admin/listings/:id/remove")
  @ApiOperation({ summary: "[Admin] Remove an inappropriate listing" })
  @ApiParam({ name: "id", type: Number })
  adminRemove(@Param("id", ParseIntPipe) id: number) {
    return this.marketplaceService.adminRemoveListing(id);
  }
}
