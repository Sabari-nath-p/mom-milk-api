import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsPositive,
  IsArray,
  IsInt,
  ValidateNested,
  IsBoolean,
  IsDateString,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import {
  MarketplaceCategory,
  MarketplaceCondition,
  MarketplaceListingStatus,
} from "@prisma/client";

// ─── Images ──────────────────────────────────────────────────────────────────

export class MarketplaceImageDto {
  @ApiProperty({ example: "https://cdn.example.com/cradle.jpg" })
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

// ─── Create / Update ──────────────────────────────────────────────────────────

export class CreateListingDto {
  @ApiProperty({ example: "Wooden Baby Cradle - Barely Used" })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: "Beautiful wooden cradle, used for 3 months...",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: 500, description: "Quantity in mls (e.g. for milk)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @ApiProperty({ enum: MarketplaceCategory })
  @IsEnum(MarketplaceCategory)
  category: MarketplaceCategory;

  @ApiPropertyOptional({ example: false, description: "If true, the price will be forced to 0" })
  @IsOptional()
  @IsBoolean()
  isDonation?: boolean;

  @ApiProperty({ enum: MarketplaceCondition })
  @IsEnum(MarketplaceCondition)
  condition: MarketplaceCondition;

  @ApiProperty({ example: "600001", description: "Seller location zipcode" })
  @IsString()
  zipcode: string;

  @ApiPropertyOptional({ example: "Chennai, Tamil Nadu" })
  @IsOptional()
  @IsString()
  placeName?: string;

  @ApiPropertyOptional({ type: [MarketplaceImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarketplaceImageDto)
  images?: MarketplaceImageDto[];

  // ─── Optional product detail fields ────────────────────────────────────────

  @ApiPropertyOptional({ example: 2999, description: "Original / retail price" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  originPrice?: number;

  @ApiPropertyOptional({
    example: "2024-01-15",
    description: "Date the item was originally purchased (ISO 8601 date)",
  })
  @IsOptional()
  @IsDateString()
  purchasedOn?: string;

  @ApiPropertyOptional({ example: "Fisher-Price", description: "Brand name" })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: ["Wood", "Cotton"],
    description: "List of materials",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @ApiPropertyOptional({
    example: ["Red", "Blue"],
    description: "Available colors",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @ApiPropertyOptional({
    example: "60cm x 40cm x 35cm",
    description: "Item dimensions",
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({
    example: ["Cradle", "Mattress", "Mosquito Net"],
    description: "What is included in the box / package",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  boxContains?: string[];
}

export class UpdateListingDto extends PartialType(CreateListingDto) {}

export class UpdateListingStatusDto {
  @ApiProperty({ enum: ["SOLD", "ACTIVE", "EXPIRED"] })
  @IsEnum(MarketplaceListingStatus)
  status: MarketplaceListingStatus;
}

// ─── Query ────────────────────────────────────────────────────────────────────

export class ListingQueryDto {
  @ApiPropertyOptional({ description: "Keyword search (title/description)" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MarketplaceCategory })
  @IsOptional()
  @IsEnum(MarketplaceCategory)
  category?: MarketplaceCategory;

  @ApiPropertyOptional({ enum: MarketplaceCondition })
  @IsOptional()
  @IsEnum(MarketplaceCondition)
  condition?: MarketplaceCondition;

  @ApiPropertyOptional({ description: "Center zipcode for geo-filtering" })
  @IsOptional()
  @IsString()
  zipcode?: string;

  @ApiPropertyOptional({
    description: "Radius in km (used with zipcode for filtering). Omit to return all listings.",
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  radiusKm?: number;

  @ApiPropertyOptional({ description: "Minimum price" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    enum: ["newest", "price_asc", "price_desc", "distance_asc"],
    description:
      "Sort order: newest (default), price_asc, price_desc, distance_asc (requires zipcode)",
    default: "newest",
  })
  @IsOptional()
  @IsString()
  sortBy?: "newest" | "price_asc" | "price_desc" | "distance_asc";
}
