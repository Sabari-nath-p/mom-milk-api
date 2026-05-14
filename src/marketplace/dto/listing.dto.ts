import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
    IsString, IsOptional, IsNumber, IsEnum, IsPositive, IsArray, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MarketplaceCategory, MarketplaceCondition, MarketplaceListingStatus } from '@prisma/client';

// ─── Images ──────────────────────────────────────────────────────────────────

export class MarketplaceImageDto {
    @ApiProperty({ example: 'https://cdn.example.com/cradle.jpg' })
    @IsString()
    url: string;

    @ApiPropertyOptional()
    @IsOptional()
    isPrimary?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    sortOrder?: number;
}

// ─── Create / Update ──────────────────────────────────────────────────────────

export class CreateListingDto {
    @ApiProperty({ example: 'Wooden Baby Cradle - Barely Used' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Beautiful wooden cradle, used for 3 months...' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 1500 })
    @IsNumber()
    @IsPositive()
    price: number;

    @ApiProperty({ enum: MarketplaceCategory })
    @IsEnum(MarketplaceCategory)
    category: MarketplaceCategory;

    @ApiProperty({ enum: MarketplaceCondition })
    @IsEnum(MarketplaceCondition)
    condition: MarketplaceCondition;

    @ApiProperty({ example: '600001', description: 'Seller location zipcode' })
    @IsString()
    zipcode: string;

    @ApiPropertyOptional({ example: 'Chennai, Tamil Nadu' })
    @IsOptional()
    @IsString()
    placeName?: string;

    @ApiPropertyOptional({ type: [MarketplaceImageDto] })
    @IsOptional()
    @IsArray()
    images?: MarketplaceImageDto[];
}

export class UpdateListingDto extends PartialType(CreateListingDto) {}

export class UpdateListingStatusDto {
    @ApiProperty({ enum: ['SOLD', 'ACTIVE', 'EXPIRED'] })
    @IsEnum(MarketplaceListingStatus)
    status: MarketplaceListingStatus;
}

// ─── Query ────────────────────────────────────────────────────────────────────

export class ListingQueryDto {
    @ApiPropertyOptional({ description: 'Keyword search (title/description)' })
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

    @ApiPropertyOptional({ description: 'Center zipcode for geo-filtering' })
    @IsOptional()
    @IsString()
    zipcode?: string;

    @ApiPropertyOptional({ description: 'Radius in km (used with zipcode)', default: 50 })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    radiusKm?: number;

    @ApiPropertyOptional({ description: 'Minimum price' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minPrice?: number;

    @ApiPropertyOptional({ description: 'Maximum price' })
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
