import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { FeedLogsService } from './feed-logs.service';
import { CreateFeedLogDto, UpdateFeedLogDto, FeedType } from './dto/feed-log.dto';
import { PaginationDto } from '../analytics/dto/analytics.dto';

@ApiTags('feed-logs')
@Controller('feed-logs')
export class FeedLogsController {
    constructor(private readonly feedLogsService: FeedLogsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new feed log entry' })
    @ApiResponse({ status: 201, description: 'Feed log created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    create(@Body() createFeedLogDto: CreateFeedLogDto) {
        return this.feedLogsService.create(createFeedLogDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all feed logs' })
    @ApiResponse({ status: 200, description: 'List of all feed logs' })
    findAll() {
        return this.feedLogsService.findAll();
    }

    @Get('baby/:babyId')
    @ApiOperation({ summary: 'Get all feed logs for a specific baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiResponse({ status: 200, description: 'List of feed logs for the baby' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    findByBabyId(@Param('babyId', ParseIntPipe) babyId: number) {
        return this.feedLogsService.findByBabyId(babyId);
    }

    @Get('baby/:babyId/date-range')
    @ApiOperation({ summary: 'Get feed logs for a baby within a date range' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
    @ApiResponse({ status: 200, description: 'List of feed logs within the date range' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    findByBabyIdAndDateRange(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.feedLogsService.findByBabyIdAndDateRange(babyId, startDate, endDate);
    }

    @Get('feed-type/:feedType')
    @ApiOperation({ summary: 'Get feed logs by feed type' })
    @ApiParam({ name: 'feedType', enum: FeedType, description: 'Feed type (BREAST, BOTTLE, OTHER)' })
    @ApiResponse({ status: 200, description: 'List of feed logs with specified feed type' })
    findByFeedType(@Param('feedType') feedType: FeedType) {
        return this.feedLogsService.findByFeedType(feedType);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get feed log by ID' })
    @ApiParam({ name: 'id', description: 'Feed log ID' })
    @ApiResponse({ status: 200, description: 'Feed log found' })
    @ApiResponse({ status: 404, description: 'Feed log not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.feedLogsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update feed log by ID' })
    @ApiParam({ name: 'id', description: 'Feed log ID' })
    @ApiResponse({ status: 200, description: 'Feed log updated successfully' })
    @ApiResponse({ status: 404, description: 'Feed log not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateFeedLogDto: UpdateFeedLogDto,
    ) {
        return this.feedLogsService.update(id, updateFeedLogDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete feed log by ID' })
    @ApiParam({ name: 'id', description: 'Feed log ID' })
    @ApiResponse({ status: 200, description: 'Feed log deleted successfully' })
    @ApiResponse({ status: 404, description: 'Feed log not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.feedLogsService.remove(id);
    }

    @Delete('baby/:babyId/all')
    @ApiOperation({ summary: 'Delete all feed logs for a specific baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiResponse({ status: 200, description: 'All feed logs deleted successfully' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    removeAllByBabyId(@Param('babyId', ParseIntPipe) babyId: number) {
        return this.feedLogsService.removeAllByBabyId(babyId);
    }

    // Paginated endpoints
    @Get('paginated')
    @ApiOperation({ summary: 'Get paginated feed logs with optional filters' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
    @ApiQuery({ name: 'babyId', required: false, description: 'Filter by baby ID' })
    @ApiResponse({ status: 200, description: 'Paginated feed logs retrieved successfully' })
    findAllPaginated(
        @Query() pagination: PaginationDto,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('babyId', ParseIntPipe) babyId?: number,
    ) {
        const filters = { startDate, endDate, babyId };
        return this.feedLogsService.findAllPaginated(pagination, filters);
    }

    @Get('baby/:babyId/paginated')
    @ApiOperation({ summary: 'Get paginated feed logs for a specific baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Paginated feed logs for baby retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    findByBabyIdPaginated(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query() pagination: PaginationDto,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const filters = { startDate, endDate };
        return this.feedLogsService.findByBabyIdPaginated(babyId, pagination, filters);
    }
}
