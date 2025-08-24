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
exports.FeedLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const feed_logs_service_1 = require("./feed-logs.service");
const feed_log_dto_1 = require("./dto/feed-log.dto");
const analytics_dto_1 = require("../analytics/dto/analytics.dto");
let FeedLogsController = class FeedLogsController {
    constructor(feedLogsService) {
        this.feedLogsService = feedLogsService;
    }
    create(createFeedLogDto) {
        return this.feedLogsService.create(createFeedLogDto);
    }
    findAll() {
        return this.feedLogsService.findAll();
    }
    findByBabyId(babyId) {
        return this.feedLogsService.findByBabyId(babyId);
    }
    findByBabyIdAndDateRange(babyId, startDate, endDate) {
        return this.feedLogsService.findByBabyIdAndDateRange(babyId, startDate, endDate);
    }
    findByFeedType(feedType) {
        return this.feedLogsService.findByFeedType(feedType);
    }
    findOne(id) {
        return this.feedLogsService.findOne(id);
    }
    update(id, updateFeedLogDto) {
        return this.feedLogsService.update(id, updateFeedLogDto);
    }
    remove(id) {
        return this.feedLogsService.remove(id);
    }
    removeAllByBabyId(babyId) {
        return this.feedLogsService.removeAllByBabyId(babyId);
    }
    findAllPaginated(pagination, startDate, endDate, babyId) {
        const filters = { startDate, endDate, babyId };
        return this.feedLogsService.findAllPaginated(pagination, filters);
    }
    findByBabyIdPaginated(babyId, pagination, startDate, endDate) {
        const filters = { startDate, endDate };
        return this.feedLogsService.findByBabyIdPaginated(babyId, pagination, filters);
    }
};
exports.FeedLogsController = FeedLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new feed log entry' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Feed log created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feed_log_dto_1.CreateFeedLogDto]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all feed logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all feed logs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('baby/:babyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all feed logs for a specific baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of feed logs for the baby' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "findByBabyId", null);
__decorate([
    (0, common_1.Get)('baby/:babyId/date-range'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feed logs for a baby within a date range' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of feed logs within the date range' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "findByBabyIdAndDateRange", null);
__decorate([
    (0, common_1.Get)('feed-type/:feedType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feed logs by feed type' }),
    (0, swagger_1.ApiParam)({ name: 'feedType', enum: feed_log_dto_1.FeedType, description: 'Feed type (BREAST, BOTTLE, OTHER)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of feed logs with specified feed type' }),
    __param(0, (0, common_1.Param)('feedType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "findByFeedType", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get feed log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Feed log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feed log found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Feed log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update feed log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Feed log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feed log updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Feed log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, feed_log_dto_1.UpdateFeedLogDto]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete feed log by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Feed log ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feed log deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Feed log not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('baby/:babyId/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete all feed logs for a specific baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All feed logs deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "removeAllByBabyId", null);
__decorate([
    (0, common_1.Get)('paginated'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated feed logs with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'babyId', required: false, description: 'Filter by baby ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated feed logs retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('babyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.PaginationDto, String, String, Number]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "findAllPaginated", null);
__decorate([
    (0, common_1.Get)('baby/:babyId/paginated'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated feed logs for a specific baby' }),
    (0, swagger_1.ApiParam)({ name: 'babyId', description: 'Baby ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated feed logs for baby retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Baby not found' }),
    __param(0, (0, common_1.Param)('babyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, analytics_dto_1.PaginationDto, String, String]),
    __metadata("design:returntype", void 0)
], FeedLogsController.prototype, "findByBabyIdPaginated", null);
exports.FeedLogsController = FeedLogsController = __decorate([
    (0, swagger_1.ApiTags)('feed-logs'),
    (0, common_1.Controller)('feed-logs'),
    __metadata("design:paramtypes", [feed_logs_service_1.FeedLogsService])
], FeedLogsController);
//# sourceMappingURL=feed-logs.controller.js.map