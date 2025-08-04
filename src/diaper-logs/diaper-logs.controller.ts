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
import { DiaperLogsService } from './diaper-logs.service';
import { CreateDiaperLogDto, UpdateDiaperLogDto, DiaperType } from './dto/diaper-log.dto';

@ApiTags('diaper-logs')
@Controller('diaper-logs')
export class DiaperLogsController {
    constructor(private readonly diaperLogsService: DiaperLogsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new diaper log entry' })
    @ApiResponse({ status: 201, description: 'Diaper log created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    create(@Body() createDiaperLogDto: CreateDiaperLogDto) {
        return this.diaperLogsService.create(createDiaperLogDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all diaper logs' })
    @ApiResponse({ status: 200, description: 'List of all diaper logs' })
    findAll() {
        return this.diaperLogsService.findAll();
    }

    @Get('baby/:babyId')
    @ApiOperation({ summary: 'Get all diaper logs for a specific baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiResponse({ status: 200, description: 'List of diaper logs for the baby' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    findByBabyId(@Param('babyId', ParseIntPipe) babyId: number) {
        return this.diaperLogsService.findByBabyId(babyId);
    }

    @Get('baby/:babyId/date-range')
    @ApiOperation({ summary: 'Get diaper logs for a baby within a date range' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
    @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
    @ApiResponse({ status: 200, description: 'List of diaper logs within the date range' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    findByBabyIdAndDateRange(
        @Param('babyId', ParseIntPipe) babyId: number,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.diaperLogsService.findByBabyIdAndDateRange(babyId, startDate, endDate);
    }

    @Get('diaper-type/:diaperType')
    @ApiOperation({ summary: 'Get diaper logs by diaper type' })
    @ApiParam({ name: 'diaperType', enum: DiaperType, description: 'Diaper type (SOLID, LIQUID, BOTH)' })
    @ApiResponse({ status: 200, description: 'List of diaper logs with specified diaper type' })
    findByDiaperType(@Param('diaperType') diaperType: DiaperType) {
        return this.diaperLogsService.findByDiaperType(diaperType);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get diaper log by ID' })
    @ApiParam({ name: 'id', description: 'Diaper log ID' })
    @ApiResponse({ status: 200, description: 'Diaper log found' })
    @ApiResponse({ status: 404, description: 'Diaper log not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.diaperLogsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update diaper log by ID' })
    @ApiParam({ name: 'id', description: 'Diaper log ID' })
    @ApiResponse({ status: 200, description: 'Diaper log updated successfully' })
    @ApiResponse({ status: 404, description: 'Diaper log not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDiaperLogDto: UpdateDiaperLogDto,
    ) {
        return this.diaperLogsService.update(id, updateDiaperLogDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete diaper log by ID' })
    @ApiParam({ name: 'id', description: 'Diaper log ID' })
    @ApiResponse({ status: 200, description: 'Diaper log deleted successfully' })
    @ApiResponse({ status: 404, description: 'Diaper log not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.diaperLogsService.remove(id);
    }

    @Delete('baby/:babyId/all')
    @ApiOperation({ summary: 'Delete all diaper logs for a specific baby' })
    @ApiParam({ name: 'babyId', description: 'Baby ID' })
    @ApiResponse({ status: 200, description: 'All diaper logs deleted successfully' })
    @ApiResponse({ status: 404, description: 'Baby not found' })
    removeAllByBabyId(@Param('babyId', ParseIntPipe) babyId: number) {
        return this.diaperLogsService.removeAllByBabyId(babyId);
    }
}
