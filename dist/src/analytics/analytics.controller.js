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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
const analytics_dto_1 = require("./dto/analytics.dto");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getFeedAnalytics(babyId, filter) {
        return this.analyticsService.getFeedAnalytics(babyId, filter);
    }
    async getDiaperAnalytics(babyId, filter) {
        return this.analyticsService.getDiaperAnalytics(babyId, filter);
    }
    async getSleepAnalytics(babyId, filter) {
        return this.analyticsService.getSleepAnalytics(babyId, filter);
    }
    async getCombinedAnalytics(babyId, filter) {
        return this.analyticsService.getCombinedAnalytics(babyId, filter);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('baby/:babyId/feed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feeding analytics for a baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID', type: 'integer' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feeding analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, analytics_dto_1.AnalyticsFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getFeedAnalytics", null);
__decorate([
    (0, common_1.Get)('baby/:babyId/diaper'),
    (0, swagger_1.ApiOperation)({ summary: 'Get diaper analytics for a baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID', type: 'integer' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diaper analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, analytics_dto_1.AnalyticsFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getDiaperAnalytics", null);
__decorate([
    (0, common_1.Get)('baby/:babyId/sleep'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sleep analytics for a baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID', type: 'integer' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sleep analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, analytics_dto_1.AnalyticsFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSleepAnalytics", null);
__decorate([
    (0, common_1.Get)('baby/:babyId/combined'),
    (0, swagger_1.ApiOperation)({ summary: 'Get combined analytics for all activities of a baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID', type: 'integer' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Combined analytics retrieved successfully' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, analytics_dto_1.AnalyticsFilterDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getCombinedAnalytics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map