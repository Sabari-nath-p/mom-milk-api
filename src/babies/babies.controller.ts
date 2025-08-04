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
import { BabiesService } from './babies.service';
import { CreateBabyDto, UpdateBabyDto, Gender } from './dto/baby.dto';

@ApiTags('babies')
@Controller('babies')
export class BabiesController {
    constructor(private readonly babiesService: BabiesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new baby profile' })
    @ApiResponse({ status: 201, description: 'Baby profile created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    @ApiResponse({ status: 404, description: 'User not found' })
    create(@Body() createBabyDto: CreateBabyDto) {
        return this.babiesService.create(createBabyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all baby profiles' })
    @ApiResponse({ status: 200, description: 'List of all baby profiles' })
    findAll() {
        return this.babiesService.findAll();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all baby profiles for a specific user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'List of baby profiles for the user' })
    @ApiResponse({ status: 404, description: 'User not found' })
    findByUserId(@Param('userId', ParseIntPipe) userId: number) {
        return this.babiesService.findByUserId(userId);
    }

    @Get('gender/:gender')
    @ApiOperation({ summary: 'Get baby profiles by gender' })
    @ApiParam({ name: 'gender', enum: Gender, description: 'Baby gender (BOY, GIRL, OTHER)' })
    @ApiResponse({ status: 200, description: 'List of baby profiles with specified gender' })
    findByGender(@Param('gender') gender: Gender) {
        return this.babiesService.findByGender(gender);
    }

    @Get('blood-group/:bloodGroup')
    @ApiOperation({ summary: 'Get baby profiles by blood group' })
    @ApiParam({ name: 'bloodGroup', description: 'Blood group (e.g., O+, A-, B+)' })
    @ApiResponse({ status: 200, description: 'List of baby profiles with specified blood group' })
    findByBloodGroup(@Param('bloodGroup') bloodGroup: string) {
        return this.babiesService.findByBloodGroup(bloodGroup);
    }

    @Get('age-range')
    @ApiOperation({ summary: 'Get baby profiles by age range in months' })
    @ApiQuery({ name: 'minMonths', description: 'Minimum age in months', example: 0 })
    @ApiQuery({ name: 'maxMonths', description: 'Maximum age in months', example: 12 })
    @ApiResponse({ status: 200, description: 'List of baby profiles within the specified age range' })
    findByAgeRange(
        @Query('minMonths', ParseIntPipe) minMonths: number,
        @Query('maxMonths', ParseIntPipe) maxMonths: number,
    ) {
        return this.babiesService.findByAgeRange(minMonths, maxMonths);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get baby profile by ID' })
    @ApiParam({ name: 'id', description: 'Baby profile ID' })
    @ApiResponse({ status: 200, description: 'Baby profile found' })
    @ApiResponse({ status: 404, description: 'Baby profile not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.babiesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update baby profile by ID' })
    @ApiParam({ name: 'id', description: 'Baby profile ID' })
    @ApiResponse({ status: 200, description: 'Baby profile updated successfully' })
    @ApiResponse({ status: 404, description: 'Baby profile not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBabyDto: UpdateBabyDto,
    ) {
        return this.babiesService.update(id, updateBabyDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete baby profile by ID' })
    @ApiParam({ name: 'id', description: 'Baby profile ID' })
    @ApiResponse({ status: 200, description: 'Baby profile deleted successfully' })
    @ApiResponse({ status: 404, description: 'Baby profile not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.babiesService.remove(id);
    }

    @Delete('user/:userId/all')
    @ApiOperation({ summary: 'Delete all baby profiles for a specific user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'All baby profiles deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    removeAllByUserId(@Param('userId', ParseIntPipe) userId: number) {
        return this.babiesService.removeAllByUserId(userId);
    }
}
