import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { DonationStatus } from "@prisma/client";

export class UpdateDonationDto {
  @ApiProperty({ enum: DonationStatus })
  @IsEnum(DonationStatus)
  status: DonationStatus;
}
