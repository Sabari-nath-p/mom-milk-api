"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBabyDto = exports.CreateBabyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
__exportStar(require("./baby-analytics.dto"), exports);
class CreateBabyDto {
}
exports.CreateBabyDto = CreateBabyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Emma Johnson' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBabyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.Gender, example: client_1.Gender.GIRL }),
    (0, class_validator_1.IsEnum)(client_1.Gender),
    __metadata("design:type", String)
], CreateBabyDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBabyDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'O+', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBabyDto.prototype, "bloodGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3.2, description: 'Weight in kg', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateBabyDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.5, description: 'Height in cm', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateBabyDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'User ID who owns this baby profile' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateBabyDto.prototype, "userId", void 0);
class UpdateBabyDto {
}
exports.UpdateBabyDto = UpdateBabyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Emma Johnson', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBabyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.Gender, example: client_1.Gender.GIRL, required: false }),
    (0, class_validator_1.IsEnum)(client_1.Gender),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBabyDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15T00:00:00.000Z', required: false }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBabyDto.prototype, "deliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'O+', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBabyDto.prototype, "bloodGroup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3.2, description: 'Weight in kg', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBabyDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.5, description: 'Height in cm', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBabyDto.prototype, "height", void 0);
//# sourceMappingURL=baby.dto.js.map