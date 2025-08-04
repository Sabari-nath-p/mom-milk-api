"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDto = exports.MilkRequestResponseDto = exports.DonorSearchResultDto = exports.RequestFiltersDto = exports.DonorSearchFiltersDto = exports.UpdateAvailabilityDto = exports.AcceptRequestDto = exports.UpdateMilkRequestDto = exports.CreateMilkRequestDto = exports.UpdateZipCodeDto = exports.CreateZipCodeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateZipCodeDto {
}
exports.CreateZipCodeDto = CreateZipCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'United States', description: 'Country name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateZipCodeDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10001', description: 'Zip code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateZipCodeDto.prototype, "zipcode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New York', description: 'Place name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateZipCodeDto.prototype, "placeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40.7128, description: 'Latitude coordinate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateZipCodeDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -74.0060, description: 'Longitude coordinate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateZipCodeDto.prototype, "longitude", void 0);
class UpdateZipCodeDto extends (0, swagger_1.PartialType)(CreateZipCodeDto) {
}
exports.UpdateZipCodeDto = UpdateZipCodeDto;
class CreateMilkRequestDto {
}
exports.CreateMilkRequestDto = CreateMilkRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RequestType, example: client_1.RequestType.MILK_REQUEST, description: 'Type of request' }),
    (0, class_validator_1.IsEnum)(client_1.RequestType),
    __metadata("design:type", String)
], CreateMilkRequestDto.prototype, "requestType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Need breast milk for newborn', description: 'Request title' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMilkRequestDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Urgent need for my 2-week old baby', description: 'Detailed description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMilkRequestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 150.5, description: 'Quantity needed in ml' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMilkRequestDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'HIGH', description: 'Urgency level' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMilkRequestDto.prototype, "urgency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-20T10:00:00.000Z', description: 'When milk is needed by' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMilkRequestDto.prototype, "neededBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Willing to travel up to 10km', description: 'Additional notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMilkRequestDto.prototype, "notes", void 0);
class UpdateMilkRequestDto extends (0, swagger_1.PartialType)(CreateMilkRequestDto) {
}
exports.UpdateMilkRequestDto = UpdateMilkRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RequestStatus, example: client_1.RequestStatus.ACCEPTED, description: 'Request status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestStatus),
    __metadata("design:type", String)
], UpdateMilkRequestDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated title', description: 'Updated request title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMilkRequestDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description', description: 'Updated detailed description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMilkRequestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 200.5, description: 'Updated quantity needed in ml' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateMilkRequestDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'MEDIUM', description: 'Updated urgency level' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMilkRequestDto.prototype, "urgency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-25T10:00:00.000Z', description: 'Updated when milk is needed by' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMilkRequestDto.prototype, "neededBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated notes', description: 'Updated additional notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMilkRequestDto.prototype, "notes", void 0);
class AcceptRequestDto {
}
exports.AcceptRequestDto = AcceptRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'I can help with this request', description: 'Message to requester' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptRequestDto.prototype, "message", void 0);
class UpdateAvailabilityDto {
}
exports.UpdateAvailabilityDto = UpdateAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'Donor availability status' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAvailabilityDto.prototype, "isAvailable", void 0);
class DonorSearchFiltersDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.DonorSearchFiltersDto = DonorSearchFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, description: 'Maximum distance in km' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], DonorSearchFiltersDto.prototype, "maxDistance", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Filter by medical record sharing willingness' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DonorSearchFiltersDto.prototype, "ableToShareMedicalRecord", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Filter by availability status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], DonorSearchFiltersDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'O+', description: 'Filter by blood group' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DonorSearchFiltersDto.prototype, "bloodGroup", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DonorSearchFiltersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], DonorSearchFiltersDto.prototype, "limit", void 0);
class RequestFiltersDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.RequestFiltersDto = RequestFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RequestStatus, description: 'Filter by request status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestStatus),
    __metadata("design:type", String)
], RequestFiltersDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RequestType, description: 'Filter by request type' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestType),
    __metadata("design:type", String)
], RequestFiltersDto.prototype, "requestType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'HIGH', description: 'Filter by urgency level' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestFiltersDto.prototype, "urgency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RequestFiltersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], RequestFiltersDto.prototype, "limit", void 0);
class DonorSearchResultDto {
}
exports.DonorSearchResultDto = DonorSearchResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Donor user information' }),
    __metadata("design:type", Object)
], DonorSearchResultDto.prototype, "donor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 5.2,
        description: 'Distance from buyer to donor in kilometers (sorted shortest to longest)'
    }),
    __metadata("design:type", Number)
], DonorSearchResultDto.prototype, "distance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '5.2 km away',
        description: 'Human-readable distance information'
    }),
    __metadata("design:type", String)
], DonorSearchResultDto.prototype, "distanceText", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'Whether donor has accepted any pending request from this user' }),
    __metadata("design:type", Boolean)
], DonorSearchResultDto.prototype, "hasAcceptedRequest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Complete location information with coordinates' }),
    __metadata("design:type", Object)
], DonorSearchResultDto.prototype, "location", void 0);
class MilkRequestResponseDto {
}
exports.MilkRequestResponseDto = MilkRequestResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Request details' }),
    __metadata("design:type", Number)
], MilkRequestResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Requester information' }),
    __metadata("design:type", Object)
], MilkRequestResponseDto.prototype, "requester", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Donor information (when accepted)' }),
    __metadata("design:type", Object)
], MilkRequestResponseDto.prototype, "donor", void 0);
class NotificationDto {
}
exports.NotificationDto = NotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Notification details' }),
    __metadata("design:type", Number)
], NotificationDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Related request (if any)' }),
    __metadata("design:type", Object)
], NotificationDto.prototype, "request", void 0);
//# sourceMappingURL=request.dto.js.map