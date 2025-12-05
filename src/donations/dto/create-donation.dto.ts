import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsEmail,
} from "class-validator";

export class CreateDonationDto {
  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: "usd" })
  @IsString()
  currency: string;

  @ApiProperty({ example: "pm_1PABCDE..." })
  @IsString()
  stripePaymentMethodId: string;

  @ApiProperty({ example: "donor@example.com", required: false })
  @IsOptional()
  @IsEmail()
  donorEmail?: string;

  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  donorName?: string;
}
