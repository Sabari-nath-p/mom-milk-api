import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto, PaginationDto } from './dto/analytics.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('baby/:babyId/feed')
    @ApiOperation({ summary: 'Get feeding analytics for a baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID', type: 'integer' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Feeding analytics retrieved successfully' })
    async getFeedAnalytics(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query() filter: AnalyticsFilterDto,
    ) {
        return this.analyticsService.getFeedAnalytics(babyId, filter);
    }

    @Get('baby/:babyId/diaper')
    @ApiOperation({ summary: 'Get diaper analytics for a baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID', type: 'integer' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Diaper analytics retrieved successfully' })
    async getDiaperAnalytics(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query() filter: AnalyticsFilterDto,
    ) {
        return this.analyticsService.getDiaperAnalytics(babyId, filter);
    }

    @Get('baby/:babyId/sleep')
    @ApiOperation({ summary: 'Get sleep analytics for a baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID', type: 'integer' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Sleep analytics retrieved successfully' })
    async getSleepAnalytics(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query() filter: AnalyticsFilterDto,
    ) {
        return this.analyticsService.getSleepAnalytics(babyId, filter);
    }

    @Get('baby/:babyId/combined')
    @ApiOperation({ summary: 'Get combined analytics for all activities of a baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID', type: 'integer' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Combined analytics retrieved successfully' })
    async getCombinedAnalytics(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query() filter: AnalyticsFilterDto,
    ) {
        return this.analyticsService.getCombinedAnalytics(babyId, filter);
    }
}
