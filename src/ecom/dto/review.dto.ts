import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewDto {
    @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    rating: number;

    @ApiPropertyOptional({ example: 'Great quality product!' })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({ example: 'The material is soft and durable...' })
    @IsOptional()
    @IsString()
    body?: string;

    @ApiPropertyOptional({ description: 'JSON array of image URLs e.g. ["https://..."]' })
    @IsOptional()
    @IsString()
    images?: string;

    @ApiPropertyOptional({ description: 'Link to your order for verified purchase badge' })
    @IsOptional()
    @IsInt()
    @IsPositive()
    orderId?: number;
}

export class CreateReviewReplyDto {
    @ApiProperty({ example: 'Thank you for your feedback!' })
    @IsString()
    body: string;
}
