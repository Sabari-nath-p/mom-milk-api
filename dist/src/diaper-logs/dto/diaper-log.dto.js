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
exports.UpdateDiaperLogDto = exports.CreateDiaperLogDto = exports.DiaperType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var DiaperType;
(function (DiaperType) {
    DiaperType["SOLID"] = "SOLID";
    DiaperType["LIQUID"] = "LIQUID";
    DiaperType["BOTH"] = "BOTH";
})(DiaperType || (exports.DiaperType = DiaperType = {}));
class CreateDiaperLogDto {
}
exports.CreateDiaperLogDto = CreateDiaperLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDiaperLogDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T10:30:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDiaperLogDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DiaperType, example: DiaperType.BOTH }),
    (0, class_validator_1.IsEnum)(DiaperType),
    __metadata("design:type", String)
], CreateDiaperLogDto.prototype, "diaperType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Normal diaper change, baby was comfortable', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDiaperLogDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Baby ID for this diaper log' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateDiaperLogDto.prototype, "babyId", void 0);
class UpdateDiaperLogDto {
}
exports.UpdateDiaperLogDto = UpdateDiaperLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiaperLogDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T10:30:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiaperLogDto.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: DiaperType, example: DiaperType.BOTH, required: false }),
    (0, class_validator_1.IsEnum)(DiaperType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiaperLogDto.prototype, "diaperType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Normal diaper change, baby was comfortable', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiaperLogDto.prototype, "note", void 0);
//# sourceMappingURL=diaper-log.dto.js.map