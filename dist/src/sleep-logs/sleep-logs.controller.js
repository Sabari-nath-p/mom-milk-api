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
exports.SleepLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sleep_logs_service_1 = require("./sleep-logs.service");
const sleep_log_dto_1 = require("./dto/sleep-log.dto");
let SleepLogsController = class SleepLogsController {
    constructor(sleepLogsService) {
        this.sleepLogsService = sleepLogsService;
    }
    create(createSleepLogDto) {
        return this.sleepLogsService.create(createSleepLogDto);
    }
    findAll() {
        return this.sleepLogsService.findAll();
    }
    findByBabyId(babyId) {
        return this.sleepLogsService.findByBabyId(babyId);
    }
    findByBabyIdAndDateRange(babyId, startDate, endDate) {
        return this.sleepLogsService.findByBabyIdAndDateRange(babyId, startDate, endDate);
    }
    getSleepAnalytics(babyId, startDate, endDate) {
        return this.sleepLogsService.getSleepDurationAnalytics(babyId, startDate, endDate);
    }
    findByLocation(location) {
        return this.sleepLogsService.findByLocation(location);
    }
    findOne(id) {
        return this.sleepLogsService.findOne(id);
    }
    update(id, updateSleepLogDto) {
        return this.sleepLogsService.update(id, updateSleepLogDto);
    }
    remove(id) {
        return this.sleepLogsService.remove(id);
    }
    removeAllByBabyId(babyId) {
        return this.sleepLogsService.removeAllByBabyId(babyId);
    }
};
exports.SleepLogsController = SleepLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new sleep log entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sleep log created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sleep_log_dto_1.CreateSleepLogDto]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sleep logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all sleep logs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('baby/:babyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sleep logs for a specific baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of sleep logs for the baby' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "findByBabyId", null);
__decorate([
    (0, common_1.Get)('baby/:babyId/date-range'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sleep logs for a baby within a date range' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of sleep logs within the date range' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "findByBabyIdAndDateRange", null);
__decorate([
    (0, common_1.Get)('baby/:babyId/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sleep analytics for a baby within a date range' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sleep analytics including duration calculations' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "getSleepAnalytics", null);
__decorate([
    (0, common_1.Get)('location/:location'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sleep logs by sleep location' }),
    (0, swagger_1.ApiParam)({ name: 'location', enum: sleep_log_dto_1.SleepLocation, description: 'Sleep location (CRIB, BED, STROLLER, OTHER)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of sleep logs with specified location' }),
    __param(0, (0, common_1.Param)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "findByLocation", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sleep log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sleep log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sleep log found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sleep log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update sleep log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sleep log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sleep log updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sleep log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sleep_log_dto_1.UpdateSleepLogDto]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete sleep log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Sleep log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sleep log deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Sleep log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('baby/:babyId/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all sleep logs for a specific baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All sleep logs deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SleepLogsController.prototype, "removeAllByBabyId", null);
exports.SleepLogsController = SleepLogsController = __decorate([
    (0, swagger_1.ApiTags)('sleep-logs'),
    (0, common_1.Controller)('sleep-logs'),
    __metadata("design:paramtypes", [sleep_logs_service_1.SleepLogsService])
], SleepLogsController);
//# sourceMappingURL=sleep-logs.controller.js.map