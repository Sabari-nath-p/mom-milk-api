import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { EcomOrderStatus } from "@prisma/client";

export class PlaceOrderDto {
  @ApiPropertyOptional({ description: "Order notes or special instructions" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: "Recipient name for shipping" })
  @IsOptional()
  @IsString()
  shippingName?: string;

  @ApiPropertyOptional({ description: "Recipient phone for shipping" })
  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @ApiPropertyOptional({ description: "Delivery address" })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiPropertyOptional({ description: "Delivery zipcode" })
  @IsOptional()
  @IsString()
  shippingZipcode?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: EcomOrderStatus })
  @IsEnum(EcomOrderStatus)
  status: EcomOrderStatus;
}

export class UpdateOrderTrackingDto {
  @ApiPropertyOptional({
    example: "TRK123456789",
    description: "Tracking / AWB / Consignment number",
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    example: "Blue Dart",
    description: "Courier / logistics carrier name (e.g. FedEx, Blue Dart, Delhivery, DHL, etc.)",
  })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({
    example: "https://www.bluedart.com/tracking/TRK123456789",
    description: "Public tracking URL for the shipment",
  })
  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @ApiPropertyOptional({
    enum: EcomOrderStatus,
    example: EcomOrderStatus.SHIPPED,
    description: "Update the order status (e.g. PROCESSING, SHIPPED, DELIVERED)",
  })
  @IsOptional()
  @IsEnum(EcomOrderStatus)
  status?: EcomOrderStatus;

  @ApiPropertyOptional({
    example: "2026-11-28T18:00:00.000Z",
    description: "Estimated delivery date/time (ISO 8601)",
  })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @ApiPropertyOptional({
    example: "2026-11-23T10:30:00.000Z",
    description: "Actual shipment dispatched date/time (ISO 8601)",
  })
  @IsOptional()
  @IsDateString()
  shippedAt?: string;

  @ApiPropertyOptional({
    example: "2026-11-27T15:00:00.000Z",
    description: "Actual delivered date/time (ISO 8601)",
  })
  @IsOptional()
  @IsDateString()
  deliveredAt?: string;

  @ApiPropertyOptional({
    example: "Package handed over to courier in Chennai hub",
    description: "Notes or comments regarding this tracking update",
  })
  @IsOptional()
  @IsString()
  trackingNotes?: string;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ enum: EcomOrderStatus })
  @IsOptional()
  @IsEnum(EcomOrderStatus)
  status?: EcomOrderStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class VendorOrderQueryDto extends OrderQueryDto {
  @ApiPropertyOptional({
    description: "Search orders by order ID, customer name, phone, or delivery address/zipcode",
    example: "John",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Filter orders placed on or after this date (ISO 8601)",
    example: "2026-11-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Filter orders placed on or before this date (ISO 8601)",
    example: "2026-11-30T23:59:59.000Z",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class OrderTrackingHistoryEntryDto {
  @ApiProperty({ example: "SHIPPED" })
  status: string;

  @ApiPropertyOptional({ example: "Blue Dart" })
  carrier?: string;

  @ApiPropertyOptional({ example: "TRK123456789" })
  trackingNumber?: string;

  @ApiPropertyOptional({ example: "Package dispatched from warehouse" })
  notes?: string;

  @ApiProperty({ example: "2026-11-23T10:30:00.000Z" })
  timestamp: string;

  @ApiProperty({ example: "VENDOR" })
  updatedBy: string;
}

export class OrderTrackingMilestoneDto {
  @ApiProperty({ example: "SHIPPED" })
  stage: string;

  @ApiProperty({ example: "Shipped" })
  title: string;

  @ApiProperty({ example: true })
  completed: boolean;

  @ApiPropertyOptional({ example: "2026-11-23T10:30:00.000Z" })
  timestamp?: string | null;
}

export class OrderTrackingDetailDto {
  @ApiPropertyOptional({ example: "TRK123456789" })
  trackingNumber?: string | null;

  @ApiPropertyOptional({ example: "Blue Dart" })
  carrier?: string | null;

  @ApiPropertyOptional({ example: "https://www.bluedart.com/tracking/TRK123456789" })
  trackingUrl?: string | null;

  @ApiProperty({ example: "SHIPPED" })
  status: string;

  @ApiPropertyOptional({ example: "2026-11-28T18:00:00.000Z" })
  estimatedDelivery?: string | null;

  @ApiPropertyOptional({ example: "2026-11-23T10:30:00.000Z" })
  shippedAt?: string | null;

  @ApiPropertyOptional({ example: null })
  deliveredAt?: string | null;

  @ApiPropertyOptional({ example: "Package handed over to courier" })
  trackingNotes?: string | null;

  @ApiProperty({ type: [OrderTrackingHistoryEntryDto] })
  history: OrderTrackingHistoryEntryDto[];

  @ApiProperty({ type: [OrderTrackingMilestoneDto] })
  timeline: OrderTrackingMilestoneDto[];
}

export class VendorOrderSummaryDto {
  @ApiProperty({ example: 42 })
  totalOrders: number;

  @ApiProperty({ example: 5 })
  pendingOrders: number;

  @ApiProperty({ example: 10 })
  confirmedOrders: number;

  @ApiProperty({ example: 8 })
  processingOrders: number;

  @ApiProperty({ example: 12 })
  shippedOrders: number;

  @ApiProperty({ example: 6 })
  deliveredOrders: number;

  @ApiProperty({ example: 1 })
  cancelledOrders: number;

  @ApiProperty({ example: 15450.5 })
  totalRevenue: number;
}
