import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { EcomOrderStatus } from '@prisma/client';

export class PlaceOrderDto {
    @ApiPropertyOptional({ description: 'Order notes or special instructions' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ description: 'Recipient name for shipping' })
    @IsOptional()
    @IsString()
    shippingName?: string;

    @ApiPropertyOptional({ description: 'Recipient phone for shipping' })
    @IsOptional()
    @IsString()
    shippingPhone?: string;

    @ApiPropertyOptional({ description: 'Delivery address' })
    @IsOptional()
    @IsString()
    shippingAddress?: string;

    @ApiPropertyOptional({ description: 'Delivery zipcode' })
    @IsOptional()
    @IsString()
    shippingZipcode?: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: EcomOrderStatus })
    @IsEnum(EcomOrderStatus)
    status: EcomOrderStatus;
}

export class OrderQueryDto {
    @ApiPropertyOptional({ enum: EcomOrderStatus })
    @IsOptional()
    @IsEnum(EcomOrderStatus)
    status?: EcomOrderStatus;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    limit?: number;
}
