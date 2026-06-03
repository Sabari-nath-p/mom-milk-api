import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, MaxLength } from "class-validator";

export class CreateVendorDto {
  @ApiProperty({ example: "Baby World Store" })
  @IsString()
  @MaxLength(100)
  storeName: string;

  @ApiPropertyOptional({ example: "Premium baby products for your little one" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "https://cdn.example.com/logo.png" })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ example: "600001" })
  @IsString()
  zipcode: string;

  @ApiPropertyOptional({ example: "123 Main St, Chennai" })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}

export class AdminUpdateVendorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
