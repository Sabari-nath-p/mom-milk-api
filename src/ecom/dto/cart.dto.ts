import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
    @ApiProperty({ description: 'Product ID' })
    @IsInt()
    @IsPositive()
    productId: number;

    @ApiPropertyOptional({ description: 'Variant ID (required for variant products)' })
    @IsOptional()
    @IsInt()
    @IsPositive()
    variantId?: number;

    @ApiProperty({ default: 1 })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    quantity: number;
}

export class UpdateCartItemDto {
    @ApiProperty({ description: 'New quantity (0 to remove)' })
    @IsInt()
    @Min(0)
    @Type(() => Number)
    quantity: number;
}
