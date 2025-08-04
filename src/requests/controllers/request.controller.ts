import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    UseGuards,
    Request,
    ParseIntPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery
} from '@nestjs/swagger';
import { RequestService } from '../services/request.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
    CreateMilkRequestDto,
    UpdateMilkRequestDto,
    AcceptRequestDto,
    UpdateAvailabilityDto,
    DonorSearchFiltersDto,
    RequestFiltersDto,
    DonorSearchResultDto,
    MilkRequestResponseDto,
    NotificationDto
} from '../dto/request.dto';

@ApiTags('Milk Requests')
@Controller('requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RequestController {
    constructor(private readonly requestService: RequestService) { }

    // Request Management
    @Post()
    @ApiOperation({ summary: 'Create a new milk request' })
    @ApiResponse({ status: 201, description: 'Request created successfully', type: MilkRequestResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async createRequest(
        @Request() req,
        @Body() createRequestDto: CreateMilkRequestDto
    ) {
        return this.requestService.createRequest(req.user.id, createRequestDto);
    }

    @Get('my-requests')
    @ApiOperation({ summary: 'Get current user\'s requests' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
    @ApiQuery({ name: 'requestType', required: false, description: 'Filter by request type' })
    @ApiQuery({ name: 'urgency', required: false, description: 'Filter by urgency' })
    @ApiResponse({ status: 200, description: 'User requests retrieved successfully' })
    async getUserRequests(
        @Request() req,
        @Query() filters: RequestFiltersDto
    ) {
        return this.requestService.getUserRequests(req.user.id, filters);
    }

    @Get('incoming')
    @ApiOperation({ summary: 'Get incoming requests for donors' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiQuery({ name: 'urgency', required: false, description: 'Filter by urgency' })
    @ApiResponse({ status: 200, description: 'Incoming requests retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Only donors can view incoming requests' })
    async getIncomingRequests(
        @Request() req,
        @Query() filters: RequestFiltersDto
    ) {
        return this.requestService.getIncomingRequests(req.user.id, filters);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a request' })
    @ApiParam({ name: 'id', description: 'Request ID' })
    @ApiResponse({ status: 200, description: 'Request updated successfully', type: MilkRequestResponseDto })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @ApiResponse({ status: 403, description: 'No permission to update this request' })
    async updateRequest(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRequestDto: UpdateMilkRequestDto
    ) {
        return this.requestService.updateRequestStatus(req.user.id, id, updateRequestDto);
    }

    @Post(':id/accept')
    @ApiOperation({ summary: 'Accept a milk request (Donor only)' })
    @ApiParam({ name: 'id', description: 'Request ID' })
    @ApiResponse({ status: 200, description: 'Request accepted successfully', type: MilkRequestResponseDto })
    @ApiResponse({ status: 404, description: 'Request not found' })
    @ApiResponse({ status: 403, description: 'Only donors can accept requests' })
    @ApiResponse({ status: 400, description: 'Request is no longer pending' })
    async acceptRequest(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() acceptDto: AcceptRequestDto
    ) {
        return this.requestService.acceptRequest(req.user.id, id, acceptDto);
    }

    // Donor Search
    @Get('search/donors')
    @ApiOperation({ summary: 'Search for available donors' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiQuery({ name: 'maxDistance', required: false, description: 'Maximum distance in km' })
    @ApiQuery({ name: 'ableToShareMedicalRecord', required: false, description: 'Filter by medical record sharing' })
    @ApiQuery({ name: 'isAvailable', required: false, description: 'Filter by availability' })
    @ApiQuery({ name: 'bloodGroup', required: false, description: 'Filter by blood group' })
    @ApiResponse({ status: 200, description: 'Donors found successfully' })
    async searchDonors(
        @Request() req,
        @Query() filters: DonorSearchFiltersDto
    ) {
        return this.requestService.searchDonors(req.user.id, filters);
    }

    // Availability Management
    @Patch('availability')
    @ApiOperation({ summary: 'Update donor availability status' })
    @ApiResponse({ status: 200, description: 'Availability updated successfully' })
    @ApiResponse({ status: 403, description: 'Only donors can update availability' })
    async updateAvailability(
        @Request() req,
        @Body() updateDto: UpdateAvailabilityDto
    ) {
        return this.requestService.updateAvailability(req.user.id, updateDto);
    }

    // Notifications
    @Get('notifications')
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
    async getNotifications(
        @Request() req,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.requestService.getUserNotifications(req.user.id, parseInt(page), parseInt(limit));
    }

    @Patch('notifications/:notificationId/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiParam({ name: 'notificationId', description: 'Notification ID' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    async markNotificationAsRead(
        @Request() req,
        @Param('notificationId', ParseIntPipe) notificationId: number
    ) {
        return this.requestService.markNotificationAsRead(req.user.id, notificationId);
    }

    @Patch('notifications/mark-all-read')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read' })
    async markAllNotificationsAsRead(@Request() req) {
        return this.requestService.markAllNotificationsAsRead(req.user.id);
    }

    // Get specific request details
    @Get(':id')
    @ApiOperation({ summary: 'Get request details by ID' })
    @ApiParam({ name: 'id', description: 'Request ID' })
    @ApiResponse({ status: 200, description: 'Request details retrieved', type: MilkRequestResponseDto })
    @ApiResponse({ status: 404, description: 'Request not found' })
    async getRequestDetails(
        @Request() req,
        @Param('id', ParseIntPipe) id: number
    ) {
        // This would need to be implemented in the service
        // For now, we can fetch from the user's requests
        const userRequests = await this.requestService.getUserRequests(req.user.id, { page: 1, limit: 1000 });
        const request = userRequests.data.find(r => r.id === id);

        if (!request) {
            // Check if it's an incoming request for donors
            const incomingRequests = await this.requestService.getIncomingRequests(req.user.id, { page: 1, limit: 1000 });
            const incomingRequest = incomingRequests.data.find(r => r.id === id);

            if (!incomingRequest) {
                throw new Error('Request not found');
            }

            return incomingRequest;
        }

        return request;
    }
}
