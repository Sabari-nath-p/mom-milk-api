import {
    Controller, Post, Get, Patch, Body, Request,
    UseGuards, Param, ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { VendorService } from '../services/vendor.service';
import { CreateVendorDto, UpdateVendorDto, AdminUpdateVendorDto } from '../dto/vendor.dto';

@ApiTags('E-Commerce / Vendor')
@Controller('ecom/vendor')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VendorController {
    constructor(private readonly vendorService: VendorService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register as a vendor/seller' })
    register(@Request() req, @Body() dto: CreateVendorDto) {
        return this.vendorService.register(req.user.id, dto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get my vendor profile' })
    getMyProfile(@Request() req) {
        return this.vendorService.getMyProfile(req.user.id);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update my vendor profile' })
    update(@Request() req, @Body() dto: UpdateVendorDto) {
        return this.vendorService.update(req.user.id, dto);
    }

    @Get(':vendorId')
    @ApiOperation({ summary: 'Get public vendor profile' })
    @ApiParam({ name: 'vendorId', type: Number })
    getPublicProfile(@Param('vendorId', ParseIntPipe) vendorId: number) {
        return this.vendorService.getPublicProfile(vendorId);
    }

    @UseGuards(AdminGuard)
    @Get()
    @ApiOperation({ summary: '[Admin] List all vendors' })
    listAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.vendorService.listAll(page, limit);
    }

    @UseGuards(AdminGuard)
    @Patch(':vendorId/admin')
    @ApiOperation({ summary: '[Admin] Verify or activate/deactivate a vendor' })
    @ApiParam({ name: 'vendorId', type: Number })
    adminUpdate(
        @Param('vendorId', ParseIntPipe) vendorId: number,
        @Body() dto: AdminUpdateVendorDto,
    ) {
        return this.vendorService.adminUpdate(vendorId, dto);
    }
}
