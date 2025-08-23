import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    Request,
    ParseIntPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery
} from '@nestjs/swagger';
import { GeolocationService } from '../services/geolocation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CreateZipCodeDto, UpdateZipCodeDto } from '../dto/request.dto';

@ApiTags('Geolocation & ZipCodes')
@Controller('geolocation')
export class GeolocationController {
    constructor(private readonly geolocationService: GeolocationService) { }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @Post('zipcodes')
    @ApiOperation({ summary: 'Create a new zipcode entry (Admin only)' })
    @ApiResponse({ status: 201, description: 'Zipcode created successfully' })
    @ApiResponse({ status: 409, description: 'Zipcode already exists' })
    async createZipCode(@Body() createZipCodeDto: CreateZipCodeDto) {
        return this.geolocationService.createZipCode(createZipCodeDto);
    }

    @Get('zipcodes')
    @ApiOperation({ summary: 'Get all zipcodes with pagination' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'Zipcodes retrieved successfully' })
    async getAllZipCodes(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '50'
    ) {
        return this.geolocationService.findAllZipCodes(parseInt(page), parseInt(limit));
    }

    @Get('zipcodes/search')
    @ApiOperation({ summary: 'Search zipcodes by query' })
    @ApiQuery({ name: 'q', description: 'Search query (zipcode, place name, or country)' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
    async searchZipCodes(
        @Query('q') query: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.geolocationService.searchZipCodes(query, parseInt(page), parseInt(limit));
    }

    @Get('zipcodes/:zipcode')
    @ApiOperation({ summary: 'Get zipcode by code' })
    @ApiParam({ name: 'zipcode', description: 'Zipcode to retrieve' })
    @ApiResponse({ status: 200, description: 'Zipcode found' })
    @ApiResponse({ status: 404, description: 'Zipcode not found' })
    async getZipCode(@Param('zipcode') zipcode: string) {
        return this.geolocationService.findZipCodeByCode(zipcode);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @Patch('zipcodes/:zipcode')
    @ApiOperation({ summary: 'Update zipcode (Admin only)' })
    @ApiParam({ name: 'zipcode', description: 'Zipcode to update' })
    @ApiResponse({ status: 200, description: 'Zipcode updated successfully' })
    @ApiResponse({ status: 404, description: 'Zipcode not found' })
    async updateZipCode(
        @Param('zipcode') zipcode: string,
        @Body() updateZipCodeDto: UpdateZipCodeDto
    ) {
        return this.geolocationService.updateZipCode(zipcode, updateZipCodeDto);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @Delete('zipcodes/:zipcode')
    @ApiOperation({ summary: 'Delete zipcode (Admin only)' })
    @ApiParam({ name: 'zipcode', description: 'Zipcode to delete' })
    @ApiResponse({ status: 200, description: 'Zipcode deleted successfully' })
    @ApiResponse({ status: 404, description: 'Zipcode not found' })
    async deleteZipCode(@Param('zipcode') zipcode: string) {
        return this.geolocationService.deleteZipCode(zipcode);
    }

    @Get('zipcodes/:zipcode/nearby')
    @ApiOperation({ summary: 'Find nearby zipcodes within radius' })
    @ApiParam({ name: 'zipcode', description: 'Center zipcode' })
    @ApiQuery({ name: 'radius', required: false, description: 'Radius in kilometers (default: 50)' })
    @ApiResponse({ status: 200, description: 'Nearby zipcodes found' })
    async findNearbyZipCodes(
        @Param('zipcode') zipcode: string,
        @Query('radius') radius: string = '50'
    ) {
        return this.geolocationService.findNearbyZipCodes(zipcode, parseInt(radius));
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @Post('zipcodes/import')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Import zipcodes from Excel (.xlsx) file (Admin only) - Clears existing data' })
    @ApiResponse({ status: 200, description: 'Import completed' })
    @ApiResponse({ status: 400, description: 'File not found or invalid format' })
    async importZipCodes() {
        // Look for Excel file first, then fallback to CSV
        const excelFilePath = 'src/data/zipcodes.xlsx';
        const csvFilePath = 'src/data/zipcodes.csv';
        
        const fs = require('fs');
        let filePath = '';
        
        if (fs.existsSync(excelFilePath)) {
            filePath = excelFilePath;
        } else if (fs.existsSync(csvFilePath)) {
            filePath = csvFilePath;
        } else {
            throw new Error('No zipcode file found. Please ensure zipcodes.xlsx or zipcodes.csv exists in src/data/ directory.');
        }
        
        return this.geolocationService.importZipCodesFromFile(filePath, true); // true = clear existing data
    }

    @Get('distance/:zipcode1/:zipcode2')
    @ApiOperation({ summary: 'Calculate distance between two zipcodes' })
    @ApiParam({ name: 'zipcode1', description: 'First zipcode' })
    @ApiParam({ name: 'zipcode2', description: 'Second zipcode' })
    @ApiResponse({ status: 200, description: 'Distance calculated successfully' })
    async calculateDistance(
        @Param('zipcode1') zipcode1: string,
        @Param('zipcode2') zipcode2: string
    ) {
        const coords1 = await this.geolocationService.getZipCodeCoordinates(zipcode1);
        const coords2 = await this.geolocationService.getZipCodeCoordinates(zipcode2);

        if (!coords1 || !coords2) {
            return { error: 'One or both zipcodes not found' };
        }

        const distance = this.geolocationService.calculateDistance(
            coords1.latitude,
            coords1.longitude,
            coords2.latitude,
            coords2.longitude
        );

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

    @Delete('zipcodes/clear')
    @ApiOperation({ summary: 'Clear all zipcode data (Admin only)' })
    @ApiResponse({ status: 200, description: 'All zipcode data cleared successfully' })
    async clearAllZipCodes() {
        return this.geolocationService.clearAllZipCodes();
    }

    @Get('zipcodes/stats')
    @ApiOperation({ summary: 'Get zipcode data statistics (Admin only)' })
    @ApiResponse({ status: 200, description: 'Zipcode statistics retrieved successfully' })
    async getZipCodeStats() {
        return this.geolocationService.getZipCodeStats();
    }
}
