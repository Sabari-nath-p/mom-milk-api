import { IsOptional, IsString, IsEnum } from "class-validator";
import { RequestStatus, RequestType } from "@prisma/client";
import { PaginationDto } from "src/analytics/dto/analytics.dto";

export class AdminRequestFiltersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(RequestType)
  requestType?: RequestType;

  // urgency is String in schema (LOW | MEDIUM | HIGH)
  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsString()
  buyerName?: string;

  @IsOptional()
  @IsString()
  donorName?: string;
}
