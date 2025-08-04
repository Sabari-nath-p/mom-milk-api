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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserType } from './dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user (donor, buyer, or admin)' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'List of all users' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get('donors')
    @ApiOperation({ summary: 'Get all donor users' })
    @ApiResponse({ status: 200, description: 'List of all donors' })
    findDonors() {
        return this.usersService.findDonors();
    }

    @Get('buyers')
    @ApiOperation({ summary: 'Get all buyer users' })
    @ApiResponse({ status: 200, description: 'List of all buyers' })
    findBuyers() {
        return this.usersService.findBuyers();
    }

    @Get('admins')
    @ApiOperation({ summary: 'Get all admin users' })
    @ApiResponse({ status: 200, description: 'List of all admins' })
    findAdmins() {
        return this.usersService.findAdmins();
    }

    @Get('donors/zipcode/:zipcode')
    @ApiOperation({ summary: 'Get donors by zipcode' })
    @ApiParam({ name: 'zipcode', description: 'Zipcode to search for donors' })
    @ApiResponse({ status: 200, description: 'List of donors in the specified zipcode' })
    findDonorsByZipcode(@Param('zipcode') zipcode: string) {
        return this.usersService.findDonorsByZipcode(zipcode);
    }

    @Get('donors/medical-record-sharing')
    @ApiOperation({ summary: 'Get donors willing to share medical records' })
    @ApiResponse({ status: 200, description: 'List of donors willing to share medical records' })
    findDonorsWillingToShareMedicalRecord() {
        return this.usersService.findDonorsWillingToShareMedicalRecord();
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Get user by email' })
    @ApiParam({ name: 'email', description: 'User email' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    findByEmail(@Param('email') email: string) {
        return this.usersService.findByEmail(email);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User found' })
    @ApiResponse({ status: 404, description: 'User not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }
}
