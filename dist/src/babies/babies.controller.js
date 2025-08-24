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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BabiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const babies_service_1 = require("./babies.service");
const baby_dto_1 = require("./dto/baby.dto");
let BabiesController = class BabiesController {
    constructor(babiesService) {
        this.babiesService = babiesService;
    }
    create(createBabyDto) {
        return this.babiesService.create(createBabyDto);
    }
    findAll() {
        return this.babiesService.findAll();
    }
    findByUserId(userId) {
        return this.babiesService.findByUserId(userId);
    }
    findByGender(gender) {
        return this.babiesService.findByGender(gender);
    }
    findByBloodGroup(bloodGroup) {
        return this.babiesService.findByBloodGroup(bloodGroup);
    }
    findByAgeRange(minMonths, maxMonths) {
        return this.babiesService.findByAgeRange(minMonths, maxMonths);
    }
    findOne(id) {
        return this.babiesService.findOne(id);
    }
    update(id, updateBabyDto) {
        return this.babiesService.update(id, updateBabyDto);
    }
    remove(id) {
        return this.babiesService.remove(id);
    }
    removeAllByUserId(userId) {
        return this.babiesService.removeAllByUserId(userId);
    }
};
exports.BabiesController = BabiesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new baby profile' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Baby profile created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [baby_dto_1.CreateBabyDto]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all baby profiles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all baby profiles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all baby profiles for a specific user' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of baby profiles for the user' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)('gender/:gender'),
    (0, swagger_1.ApiOperation)({ summary: 'Get baby profiles by gender' }),
    (0, swagger_1.ApiParam)({ name: 'gender', enum: baby_dto_1.Gender, description: 'Baby gender (BOY, GIRL, OTHER)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of baby profiles with specified gender' }),
    __param(0, (0, common_1.Param)('gender')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "findByGender", null);
__decorate([
    (0, common_1.Get)('blood-group/:bloodGroup'),
    (0, swagger_1.ApiOperation)({ summary: 'Get baby profiles by blood group' }),
    (0, swagger_1.ApiParam)({ name: 'bloodGroup', description: 'Blood group (e.g., O+, A-, B+)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of baby profiles with specified blood group' }),
    __param(0, (0, common_1.Param)('bloodGroup')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "findByBloodGroup", null);
__decorate([
    (0, common_1.Get)('age-range'),
    (0, swagger_1.ApiOperation)({ summary: 'Get baby profiles by age range in months' }),
    (0, swagger_1.ApiQuery)({ name: 'minMonths', description: 'Minimum age in months', example: 0 }),
    (0, swagger_1.ApiQuery)({ name: 'maxMonths', description: 'Maximum age in months', example: 12 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of baby profiles within the specified age range' }),
    __param(0, (0, common_1.Query)('minMonths', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('maxMonths', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "findByAgeRange", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get baby profile by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Baby profile ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Baby profile found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby profile not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update baby profile by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Baby profile ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Baby profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby profile not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, baby_dto_1.UpdateBabyDto]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete baby profile by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Baby profile ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Baby profile deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby profile not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('user/:userId/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all baby profiles for a specific user' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All baby profiles deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BabiesController.prototype, "removeAllByUserId", null);
exports.BabiesController = BabiesController = __decorate([
    (0, swagger_1.ApiTags)('babies'),
    (0, common_1.Controller)('babies'),
    __metadata("design:paramtypes", [babies_service_1.BabiesService])
], BabiesController);
//# sourceMappingURL=babies.controller.js.map