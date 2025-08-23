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
exports.RequestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const request_service_1 = require("../services/request.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const request_dto_1 = require("../dto/request.dto");
let RequestController = class RequestController {
    constructor(requestService) {
        this.requestService = requestService;
    }
    async createRequest(req, createRequestDto) {
        return this.requestService.createRequest(req.user.id, createRequestDto);
    }
    async getUserRequests(req, filters) {
        return this.requestService.getUserRequests(req.user.id, filters);
    }
    async getIncomingRequests(req, filters) {
        return this.requestService.getIncomingRequests(req.user.id, filters);
    }
    async updateRequest(req, id, updateRequestDto) {
        return this.requestService.updateRequestStatus(req.user.id, id, updateRequestDto);
    }
    async acceptRequest(req, id, acceptDto) {
        return this.requestService.acceptRequest(req.user.id, id, acceptDto);
    }
    async searchDonors(req, filters) {
        return this.requestService.searchDonors(req.user.id, filters);
    }
    async updateAvailability(req, updateDto) {
        return this.requestService.updateAvailability(req.user.id, updateDto);
    }
    async getNotifications(req, page = '1', limit = '20') {
        return this.requestService.getUserNotifications(req.user.id, parseInt(page), parseInt(limit));
    }
    async markNotificationAsRead(req, notificationId) {
        return this.requestService.markNotificationAsRead(req.user.id, notificationId);
    }
    async markAllNotificationsAsRead(req) {
        return this.requestService.markAllNotificationsAsRead(req.user.id);
    }
    async getRequestDetails(req, id) {
        const userRequests = await this.requestService.getUserRequests(req.user.id, { page: 1, limit: 1000 });
        const request = userRequests.data.find(r => r.id === id);
        if (!request) {
            const incomingRequests = await this.requestService.getIncomingRequests(req.user.id, { page: 1, limit: 1000 });
            const incomingRequest = incomingRequests.data.find(r => r.id === id);
            if (!incomingRequest) {
                throw new Error('Request not found');
            }
            return incomingRequest;
        }
        return request;
    }
};
exports.RequestController = RequestController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new milk request' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Request created successfully', type: request_dto_1.MilkRequestResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, request_dto_1.CreateMilkRequestDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s requests' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'requestType', required: false, description: 'Filter by request type' }),
    (0, swagger_1.ApiQuery)({ name: 'urgency', required: false, description: 'Filter by urgency' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User requests retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, request_dto_1.RequestFiltersDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "getUserRequests", null);
__decorate([
    (0, common_1.Get)('incoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get incoming requests for donors' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'urgency', required: false, description: 'Filter by urgency' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Incoming requests retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only donors can view incoming requests' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, request_dto_1.RequestFiltersDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "getIncomingRequests", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a request' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Request ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Request updated successfully', type: request_dto_1.MilkRequestResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'No permission to update this request' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, request_dto_1.UpdateMilkRequestDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "updateRequest", null);
__decorate([
    (0, common_1.Post)(':id/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a milk request (Donor only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Request ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Request accepted successfully', type: request_dto_1.MilkRequestResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only donors can accept requests' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Request is no longer pending' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, request_dto_1.AcceptRequestDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "acceptRequest", null);
__decorate([
    (0, common_1.Get)('search/donors'),
    (0, swagger_1.ApiOperation)({ summary: 'Search for available donors' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'maxDistance', required: false, description: 'Maximum distance in km' }),
    (0, swagger_1.ApiQuery)({ name: 'ableToShareMedicalRecord', required: false, description: 'Filter by medical record sharing' }),
    (0, swagger_1.ApiQuery)({ name: 'isAvailable', required: false, description: 'Filter by availability' }),
    (0, swagger_1.ApiQuery)({ name: 'bloodGroup', required: false, description: 'Filter by blood group' }),
    (0, swagger_1.ApiQuery)({ name: 'zipcode', required: false, description: 'Filter by donor zipcode' }),
    (0, swagger_1.ApiQuery)({ name: 'donorName', required: false, description: 'Search by donor name' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Donors found successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, request_dto_1.DonorSearchFiltersDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "searchDonors", null);
__decorate([
    (0, common_1.Patch)('availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Update donor availability status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Availability updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only donors can update availability' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, request_dto_1.UpdateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notifications' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:notificationId/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiParam)({ name: 'notificationId', description: 'Notification ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('notificationId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Patch)('notifications/mark-all-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications marked as read' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get request details by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Request ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Request details retrieved', type: request_dto_1.MilkRequestResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Request not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], RequestController.prototype, "getRequestDetails", null);
exports.RequestController = RequestController = __decorate([
    (0, swagger_1.ApiTags)('Milk Requests'),
    (0, common_1.Controller)('requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [request_service_1.RequestService])
], RequestController);
//# sourceMappingURL=request.controller.js.map