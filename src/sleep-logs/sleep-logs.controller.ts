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
import { SleepLogsService } from './sleep-logs.service';
import { CreateSleepLogDto, UpdateSleepLogDto, SleepLocation } from './dto/sleep-log.dto';

@ApiTags('sleep-logs')
@Controller('sleep-logs')
export class SleepLogsController {
    constructor(private readonly sleepLogsService: SleepLogsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new sleep log entry' })
    @ApiResponse({ status: 201, description: 'Sleep log created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    create(@Body() createSleepLogDto: CreateSleepLogDto) {
        return this.sleepLogsService.create(createSleepLogDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all sleep logs' })
    @ApiResponse({ status: 200, description: 'List of all sleep logs' })
    findAll() {
        return this.sleepLogsService.findAll();
    }

    @Get('baby/:babyId')
    @ApiOperation({ summary: 'Get all sleep logs for a specific baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiResponse({ status: 200, description: 'List of sleep logs for the baby' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    findByBabyId(@Param('babyId', ParseIntPipe) babyId: number) {
        return this.sleepLogsService.findByBabyId(babyId);
    }

    @Get('baby/:babyId/date-range')
    @ApiOperation({ summary: 'Get sleep logs for a baby within a date range' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
    @ApiResponse({ status: 200, description: 'List of sleep logs within the date range' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    findByBabyIdAndDateRange(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.sleepLogsService.findByBabyIdAndDateRange(babyId, startDate, endDate);
    }

    @Get('baby/:babyId/analytics')
    @ApiOperation({ summary: 'Get sleep analytics for a baby within a date range' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
    @ApiResponse({ status: 200, description: 'Sleep analytics including duration calculations' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    getSleepAnalytics(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.sleepLogsService.getSleepDurationAnalytics(babyId, startDate, endDate);
    }

    @Get('location/:location')
    @ApiOperation({ summary: 'Get sleep logs by sleep location' })
    @ApiParam({ name: 'location', enum: SleepLocation, description: 'Sleep location (CRIB, BED, STROLLER, OTHER)' })
    @ApiResponse({ status: 200, description: 'List of sleep logs with specified location' })
    findByLocation(@Param('location') location: SleepLocation) {
        return this.sleepLogsService.findByLocation(location);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get sleep log by ID' })
    @ApiParam({ name: 'id', description: 'Sleep log ID' })
    @ApiResponse({ status: 200, description: 'Sleep log found' })
    @ApiResponse({ status: 404, description: 'Sleep log not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.sleepLogsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update sleep log by ID' })
    @ApiParam({ name: 'id', description: 'Sleep log ID' })
    @ApiResponse({ status: 200, description: 'Sleep log updated successfully' })
    @ApiResponse({ status: 404, description: 'Sleep log not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSleepLogDto: UpdateSleepLogDto,
    ) {
        return this.sleepLogsService.update(id, updateSleepLogDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete sleep log by ID' })
    @ApiParam({ name: 'id', description: 'Sleep log ID' })
    @ApiResponse({ status: 200, description: 'Sleep log deleted successfully' })
    @ApiResponse({ status: 404, description: 'Sleep log not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.sleepLogsService.remove(id);
    }

    @Delete('baby/:babyId/all')
    @ApiOperation({ summary: 'Delete all sleep logs for a specific baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiResponse({ status: 200, description: 'All sleep logs deleted successfully' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    removeAllByBabyId(@Param('babyId', ParseIntPipe) babyId: number) {
        return this.sleepLogsService.removeAllByBabyId(babyId);
    }
}
