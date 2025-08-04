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
exports.UpdateSleepLogDto = exports.CreateSleepLogDto = exports.SleepLocation = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var SleepLocation;
(function (SleepLocation) {
    SleepLocation["CRIB"] = "CRIB";
    SleepLocation["BED"] = "BED";
    SleepLocation["STROLLER"] = "STROLLER";
    SleepLocation["OTHER"] = "OTHER";
})(SleepLocation || (exports.SleepLocation = SleepLocation = {}));
class CreateSleepLogDto {
}
exports.CreateSleepLogDto = CreateSleepLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSleepLogDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T20:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSleepLogDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-16T06:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSleepLogDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Deep sleep, peaceful night', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSleepLogDto.prototype, "sleepQuality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SleepLocation, example: SleepLocation.CRIB }),
    (0, class_validator_1.IsEnum)(SleepLocation),
    __metadata("design:type", String)
], CreateSleepLogDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Baby slept well through the night', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSleepLogDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Baby ID for this sleep log' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateSleepLogDto.prototype, "babyId", void 0);
class UpdateSleepLogDto {
}
exports.UpdateSleepLogDto = UpdateSleepLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSleepLogDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T20:00:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSleepLogDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-16T06:00:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSleepLogDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Deep sleep, peaceful night', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSleepLogDto.prototype, "sleepQuality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SleepLocation, example: SleepLocation.CRIB, required: false }),
    (0, class_validator_1.IsEnum)(SleepLocation),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSleepLogDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Baby slept well through the night', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSleepLogDto.prototype, "note", void 0);
//# sourceMappingURL=sleep-log.dto.js.map