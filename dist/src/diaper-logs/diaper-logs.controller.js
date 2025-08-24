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
exports.DiaperLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const diaper_logs_service_1 = require("./diaper-logs.service");
const diaper_log_dto_1 = require("./dto/diaper-log.dto");
let DiaperLogsController = class DiaperLogsController {
    constructor(diaperLogsService) {
        this.diaperLogsService = diaperLogsService;
    }
    create(createDiaperLogDto) {
        return this.diaperLogsService.create(createDiaperLogDto);
    }
    findAll() {
        return this.diaperLogsService.findAll();
    }
    findByBabyId(babyId) {
        return this.diaperLogsService.findByBabyId(babyId);
    }
    findByBabyIdAndDateRange(babyId, startDate, endDate) {
        return this.diaperLogsService.findByBabyIdAndDateRange(babyId, startDate, endDate);
    }
    findByDiaperType(diaperType) {
        return this.diaperLogsService.findByDiaperType(diaperType);
    }
    findOne(id) {
        return this.diaperLogsService.findOne(id);
    }
    update(id, updateDiaperLogDto) {
        return this.diaperLogsService.update(id, updateDiaperLogDto);
    }
    remove(id) {
        return this.diaperLogsService.remove(id);
    }
    removeAllByBabyId(babyId) {
        return this.diaperLogsService.removeAllByBabyId(babyId);
    }
};
exports.DiaperLogsController = DiaperLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new diaper log entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Diaper log created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [diaper_log_dto_1.CreateDiaperLogDto]),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all diaper logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all diaper logs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('baby/:babyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all diaper logs for a specific baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of diaper logs for the baby' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "findByBabyId", null);
__decorate([
    (0, common_1.Get)('baby/:babyId/date-range'),
    (0, swagger_1.ApiOperation)({ summary: 'Get diaper logs for a baby within a date range' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of diaper logs within the date range' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "findByBabyIdAndDateRange", null);
__decorate([
    (0, common_1.Get)('diaper-type/:diaperType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get diaper logs by diaper type' }),
    (0, swagger_1.ApiParam)({ name: 'diaperType', enum: diaper_log_dto_1.DiaperType, description: 'Diaper type (SOLID, LIQUID, BOTH)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of diaper logs with specified diaper type' }),
    __param(0, (0, common_1.Param)('diaperType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "findByDiaperType", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get diaper log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Diaper log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diaper log found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diaper log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update diaper log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Diaper log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diaper log updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diaper log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, diaper_log_dto_1.UpdateDiaperLogDto]),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete diaper log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Diaper log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Diaper log deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Diaper log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('baby/:babyId/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all diaper logs for a specific baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All diaper logs deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DiaperLogsController.prototype, "removeAllByBabyId", null);
exports.DiaperLogsController = DiaperLogsController = __decorate([
    (0, swagger_1.ApiTags)('diaper-logs'),
    (0, common_1.Controller)('diaper-logs'),
    __metadata("design:paramtypes", [diaper_logs_service_1.DiaperLogsService])
], DiaperLogsController);
//# sourceMappingURL=diaper-logs.controller.js.map