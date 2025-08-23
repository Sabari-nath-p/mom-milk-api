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
exports.GeolocationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const geolocation_service_1 = require("../services/geolocation.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const admin_guard_1 = require("../../auth/guards/admin.guard");
const request_dto_1 = require("../dto/request.dto");
let GeolocationController = class GeolocationController {
    constructor(geolocationService) {
        this.geolocationService = geolocationService;
    }
    async createZipCode(createZipCodeDto) {
        return this.geolocationService.createZipCode(createZipCodeDto);
    }
    async getAllZipCodes(page = '1', limit = '50') {
        return this.geolocationService.findAllZipCodes(parseInt(page), parseInt(limit));
    }
    async searchZipCodes(query, page = '1', limit = '20') {
        return this.geolocationService.searchZipCodes(query, parseInt(page), parseInt(limit));
    }
    async getZipCode(zipcode) {
        return this.geolocationService.findZipCodeByCode(zipcode);
    }
    async updateZipCode(zipcode, updateZipCodeDto) {
        return this.geolocationService.updateZipCode(zipcode, updateZipCodeDto);
    }
    async deleteZipCode(zipcode) {
        return this.geolocationService.deleteZipCode(zipcode);
    }
    async findNearbyZipCodes(zipcode, radius = '50') {
        return this.geolocationService.findNearbyZipCodes(zipcode, parseInt(radius));
    }
    async importZipCodes() {
        const excelFilePath = 'src/data/zipcodes.xlsx';
        const csvFilePath = 'src/data/zipcodes.csv';
        const fs = require('fs');
        let filePath = '';
        if (fs.existsSync(excelFilePath)) {
            filePath = excelFilePath;
        }
        else if (fs.existsSync(csvFilePath)) {
            filePath = csvFilePath;
        }
        else {
            throw new Error('No zipcode file found. Please ensure zipcodes.xlsx or zipcodes.csv exists in src/data/ directory.');
        }
        return this.geolocationService.importZipCodesFromFile(filePath, true);
    }
    async calculateDistance(zipcode1, zipcode2) {
        const coords1 = await this.geolocationService.getZipCodeCoordinates(zipcode1);
        const coords2 = await this.geolocationService.getZipCodeCoordinates(zipcode2);
        if (!coords1 || !coords2) {
            return { error: 'One or both zipcodes not found' };
        }
        const distance = this.geolocationService.calculateDistance(coords1.latitude, coords1.longitude, coords2.latitude, coords2.longitude);
        return {
            zipcode1,
            zipcode2,
            distance,
            unit: 'km',
            locations: {
                [zipcode1]: coords1,
                [zipcode2]: coords2,
            },
        };
    }
    async clearAllZipCodes() {
        return this.geolocationService.clearAllZipCodes();
    }
    async getZipCodeStats() {
        return this.geolocationService.getZipCodeStats();
    }
};
exports.GeolocationController = GeolocationController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('zipcodes'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new zipcode entry (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Zipcode created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Zipcode already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_dto_1.CreateZipCodeDto]),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "createZipCode", null);
__decorate([
    (0, common_1.Get)('zipcodes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all zipcodes with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Zipcodes retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "getAllZipCodes", null);
__decorate([
    (0, common_1.Get)('zipcodes/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search zipcodes by query' }),
    (0, swagger_1.ApiQuery)({ name: 'q', description: 'Search query (zipcode, place name, or country)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved successfully' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "searchZipCodes", null);
__decorate([
    (0, common_1.Get)('zipcodes/:zipcode'),
    (0, swagger_1.ApiOperation)({ summary: 'Get zipcode by code' }),
    (0, swagger_1.ApiParam)({ name: 'zipcode', description: 'Zipcode to retrieve' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Zipcode found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Zipcode not found' }),
    __param(0, (0, common_1.Param)('zipcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "getZipCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('zipcodes/:zipcode'),
    (0, swagger_1.ApiOperation)({ summary: 'Update zipcode (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'zipcode', description: 'Zipcode to update' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Zipcode updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Zipcode not found' }),
    __param(0, (0, common_1.Param)('zipcode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_dto_1.UpdateZipCodeDto]),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "updateZipCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('zipcodes/:zipcode'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete zipcode (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'zipcode', description: 'Zipcode to delete' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Zipcode deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Zipcode not found' }),
    __param(0, (0, common_1.Param)('zipcode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "deleteZipCode", null);
__decorate([
    (0, common_1.Get)('zipcodes/:zipcode/nearby'),
    (0, swagger_1.ApiOperation)({ summary: 'Find nearby zipcodes within radius' }),
    (0, swagger_1.ApiParam)({ name: 'zipcode', description: 'Center zipcode' }),
    (0, swagger_1.ApiQuery)({ name: 'radius', required: false, description: 'Radius in kilometers (default: 50)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nearby zipcodes found' }),
    __param(0, (0, common_1.Param)('zipcode')),
    __param(1, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "findNearbyZipCodes", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('zipcodes/import'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Import zipcodes from Excel (.xlsx) file (Admin only) - Clears existing data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Import completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'File not found or invalid format' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "importZipCodes", null);
__decorate([
    (0, common_1.Get)('distance/:zipcode1/:zipcode2'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate distance between two zipcodes' }),
    (0, swagger_1.ApiParam)({ name: 'zipcode1', description: 'First zipcode' }),
    (0, swagger_1.ApiParam)({ name: 'zipcode2', description: 'Second zipcode' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Distance calculated successfully' }),
    __param(0, (0, common_1.Param)('zipcode1')),
    __param(1, (0, common_1.Param)('zipcode2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "calculateDistance", null);
__decorate([
    (0, common_1.Delete)('zipcodes/clear'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all zipcode data (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All zipcode data cleared successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "clearAllZipCodes", null);
__decorate([
    (0, common_1.Get)('zipcodes/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get zipcode data statistics (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Zipcode statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeolocationController.prototype, "getZipCodeStats", null);
exports.GeolocationController = GeolocationController = __decorate([
    (0, swagger_1.ApiTags)('Geolocation & ZipCodes'),
    (0, common_1.Controller)('geolocation'),
    __metadata("design:paramtypes", [geolocation_service_1.GeolocationService])
], GeolocationController);
//# sourceMappingURL=geolocation.controller.js.map