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
exports.UpdateFeedLogDto = exports.CreateFeedLogDto = exports.Position = exports.FeedType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var FeedType;
(function (FeedType) {
    FeedType["BREAST"] = "BREAST";
    FeedType["BOTTLE"] = "BOTTLE";
    FeedType["OTHER"] = "OTHER";
})(FeedType || (exports.FeedType = FeedType = {}));
var Position;
(function (Position) {
    Position["LEFT"] = "LEFT";
    Position["RIGHT"] = "RIGHT";
    Position["BOTH"] = "BOTH";
})(Position || (exports.Position = Position = {}));
class CreateFeedLogDto {
}
exports.CreateFeedLogDto = CreateFeedLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateFeedLogDto.prototype, "feedingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T09:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateFeedLogDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T09:30:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateFeedLogDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FeedType, example: FeedType.BREAST }),
    (0, class_validator_1.IsEnum)(FeedType),
    __metadata("design:type", String)
], CreateFeedLogDto.prototype, "feedType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Position, example: Position.LEFT, required: false }),
    (0, class_validator_1.IsEnum)(Position),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFeedLogDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120.5, description: 'Amount in ml', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFeedLogDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Baby fed well and seemed satisfied', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFeedLogDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Baby ID for this feed log' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateFeedLogDto.prototype, "babyId", void 0);
class UpdateFeedLogDto {
}
exports.UpdateFeedLogDto = UpdateFeedLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFeedLogDto.prototype, "feedingDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T09:00:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFeedLogDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T09:30:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFeedLogDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: FeedType, example: FeedType.BREAST, required: false }),
    (0, class_validator_1.IsEnum)(FeedType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFeedLogDto.prototype, "feedType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Position, example: Position.LEFT, required: false }),
    (0, class_validator_1.IsEnum)(Position),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFeedLogDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 120.5, description: 'Amount in ml', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateFeedLogDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Baby fed well and seemed satisfied', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFeedLogDto.prototype, "note", void 0);
//# sourceMappingURL=feed-log.dto.js.map