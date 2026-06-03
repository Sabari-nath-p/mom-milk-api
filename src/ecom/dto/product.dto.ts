import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsArray,
  Min,
  Max,
  IsPositive,
} from "class-validator";
import { Type } from "class-transformer";

// ─── Category ────────────────────────────────────────────────────────────────

export class CreateCategoryDto {
  @ApiProperty({ example: "Baby Clothing" })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ─── Product Image ────────────────────────────────────────────────────────────

export class ProductImageDto {
  @ApiProperty({ example: "https://cdn.example.com/image.jpg" })
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

// ─── Product Variant ──────────────────────────────────────────────────────────

export class CreateVariantDto {
  @ApiProperty({ example: "Red - Large" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: "SKU-001" })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 299.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: '{"color":"Red","size":"L"}' })
  @IsOptional()
  @IsString()
  attributes?: string;
}

export class UpdateVariantDto extends PartialType(CreateVariantDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export class CreateProductDto {
  @ApiPropertyOptional({ description: "Category ID (optional)" })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ example: "Organic Baby Onesie" })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @ApiPropertyOptional({
    default: 0,
    description: "Used when hasVariants = false",
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @ApiPropertyOptional({ example: '["baby","organic","clothing"]' })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ type: [ProductImageDto] })
  @IsOptional()
  @IsArray()
  images?: ProductImageDto[];

  @ApiPropertyOptional({
    type: [CreateVariantDto],
    description: "Required if hasVariants=true",
  })
  @IsOptional()
  @IsArray()
  variants?: CreateVariantDto[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ─── Query Filters ────────────────────────────────────────────────────────────

export class ProductQueryDto {
  @ApiPropertyOptional({ description: "Search by name or description" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Filter by category ID" })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ description: "Filter by vendor ID" })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  vendorId?: number;

  @ApiPropertyOptional({ description: "Center zipcode for geo-filtering" })
  @IsOptional()
  @IsString()
  zipcode?: string;

  @ApiPropertyOptional({
    description: "Radius in km (used with zipcode)",
    default: 50,
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
}
