import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { VendorGuard } from "../../auth/guards/vendor.guard";
import { VendorService } from "../services/vendor.service";
import { AuthService } from "../../auth/auth.service";
import { EcomOrdersService } from "../services/ecom-orders.service";
import {
  CreateVendorDto,
  UpdateVendorDto,
  AdminUpdateVendorDto,
  RegisterVendorDto,
  VendorSendOtpDto,
  VendorLoginDto,
  VendorPasswordLoginDto,
  UpdateVendorPasswordDto,
  VendorAuthResponseDto,
  VendorRegisterResponseDto,
} from "../dto/vendor.dto";
import {
  VendorOrderQueryDto,
  UpdateOrderTrackingDto,
  VendorOrderSummaryDto,
} from "../dto/order.dto";
import { OtpResponseDto } from "../../auth/dto/auth.dto";

@ApiTags("E-Commerce / Vendor")
@Controller("ecom/vendor")
export class VendorController {
  constructor(
    private readonly vendorService: VendorService,
    private readonly authService: AuthService,
    private readonly ordersService: EcomOrdersService,
  ) {}

  // ─── Vendor Registration & Authentication ───────────────────────────────────

  @Post("register")
  @ApiOperation({
    summary: "Register as a vendor / seller (Direct Registration)",
    description:
      "Direct public registration for new vendors with owner details, password, and store information. Generates and sends OTP to email for verification. Use vendor verify-otp (login) endpoint to verify OTP and obtain access token.",
  })
  @ApiResponse({
    status: 201,
    description: "Vendor registered successfully and OTP sent to email",
    type: VendorRegisterResponseDto,
  })
  @ApiResponse({ status: 409, description: "Vendor already exists with this email" })
  register(@Body() dto: RegisterVendorDto): Promise<VendorRegisterResponseDto> {
    return this.vendorService.directRegister(dto);
  }

  @Post("auth/register")
  @ApiOperation({
    summary: "Register as a vendor / seller (Auth namespace alias)",
    description:
      "Alias endpoint for vendor direct registration under /ecom/vendor/auth/register. Generates and sends OTP to email for verification.",
  })
  @ApiResponse({
    status: 201,
    description: "Vendor registered successfully and OTP sent to email",
    type: VendorRegisterResponseDto,
  })
  registerAuthAlias(@Body() dto: RegisterVendorDto): Promise<VendorRegisterResponseDto> {
    return this.vendorService.directRegister(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post("register-profile")
  @ApiOperation({
    summary: "Register vendor profile for an existing authenticated user",
    description:
      "Allows an already logged-in user (Buyer/Donor) to upgrade their account to become a vendor.",
  })
  registerProfile(@Request() req, @Body() dto: CreateVendorDto) {
    return this.vendorService.register(req.user.id, dto);
  }

  @Post("auth/send-otp")
  @ApiOperation({
    summary: "Send OTP to vendor email for login",
    description:
      "Validates that the email belongs to a registered active vendor, then sends an OTP.",
  })
  @ApiResponse({
    status: 200,
    description: "OTP sent successfully to vendor email",
    type: OtpResponseDto,
  })
  sendOtp(@Body() dto: VendorSendOtpDto): Promise<OtpResponseDto> {
    return this.authService.sendVendorOtp(dto);
  }

  @Post("auth/login-password")
  @ApiOperation({
    summary: "Login as a vendor using email and password",
    description:
      "Authenticates vendor credentials using password and returns JWT token with vendor profile.",
  })
  @ApiResponse({
    status: 200,
    description: "Vendor authenticated successfully",
    type: VendorAuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid email or password" })
  loginPassword(@Body() dto: VendorPasswordLoginDto): Promise<VendorAuthResponseDto> {
    return this.authService.vendorPasswordLogin(dto);
  }

  @Post("auth/login")
  @ApiOperation({
    summary: "Login as a vendor using email with password or OTP",
    description:
      "Verifies credentials (password or 6-digit OTP), checks vendor status, and returns JWT token with vendor profile.",
  })
  @ApiResponse({
    status: 200,
    description: "Vendor authenticated successfully",
    type: VendorAuthResponseDto,
  })
  login(@Body() dto: VendorLoginDto): Promise<VendorAuthResponseDto> {
    return this.authService.vendorLogin(dto);
  }

  // ─── Vendor Profile Management ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("me")
  @ApiOperation({ summary: "Get my vendor profile" })
  getMyProfile(@Request() req) {
    return this.vendorService.getMyProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch("me")
  @ApiOperation({ summary: "Update my vendor profile" })
  update(@Request() req, @Body() dto: UpdateVendorDto) {
    return this.vendorService.update(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, VendorGuard)
  @ApiBearerAuth()
  @Patch("password")
  @ApiOperation({
    summary: "Change or set vendor account password",
    description:
      "Allows an authenticated vendor to change their password for password login.",
  })
  updatePassword(@Request() req, @Body() dto: UpdateVendorPasswordDto) {
    return this.vendorService.updatePassword(req.user.id, dto);
  }

  // ─── Vendor Order Requests & Details (Vendor Portal) ───────────────────────

  @UseGuards(JwtAuthGuard, VendorGuard)
  @ApiBearerAuth()
  @Get("orders/summary")
  @ApiOperation({
    summary: "[Vendor] Get dashboard summary of incoming orders and revenue",
  })
  @ApiResponse({
    status: 200,
    description: "Orders count by status and total revenue",
    type: VendorOrderSummaryDto,
  })
  getVendorOrderSummary(@Request() req) {
    return this.ordersService.getVendorOrderSummary(req.user.id);
  }

  @UseGuards(JwtAuthGuard, VendorGuard)
  @ApiBearerAuth()
  @Get("orders")
  @ApiOperation({
    summary: "[Vendor] See incoming order requests for vendor products",
    description:
      "Lists order requests containing products from this vendor with buyer info, vendor items, vendor subtotal, search, and tracking.",
  })
  getVendorOrders(@Request() req, @Query() query: VendorOrderQueryDto) {
    return this.ordersService.getVendorOrders(req.user.id, query);
  }

  @UseGuards(JwtAuthGuard, VendorGuard)
  @ApiBearerAuth()
  @Get("orders/:orderId")
  @ApiOperation({
    summary: "[Vendor] View order details page for an order request",
    description:
      "Returns comprehensive order information including customer info, delivery address, ordered items with images and subtotal, full tracking details, history log, and milestone timeline.",
  })
  @ApiParam({ name: "orderId", type: Number })
  getVendorOrderDetail(
    @Request() req,
    @Param("orderId", ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getVendorOrderDetail(req.user.id, orderId);
  }

  @UseGuards(JwtAuthGuard, VendorGuard)
  @ApiBearerAuth()
  @Patch("orders/:orderId/tracking")
  @ApiOperation({
    summary: "[Vendor] Manually update order tracking and dispatch details",
    description:
      "Allows the vendor to assign courier name, tracking number, tracking URL, estimated delivery date, dispatch notes, and advance status (e.g. to SHIPPED or DELIVERED). Automatically notifies the customer via email and push notification.",
  })
  @ApiParam({ name: "orderId", type: Number })
  updateOrderTracking(
    @Request() req,
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderTrackingDto,
  ) {
    return this.ordersService.updateOrderTracking(
      req.user.id,
      orderId,
      dto,
      false,
    );
  }

  // ─── Public Vendor Profile ──────────────────────────────────────────────────

  @Get(":vendorId")
  @ApiOperation({ summary: "Get public vendor profile" })
  @ApiParam({ name: "vendorId", type: Number })
  getPublicProfile(@Param("vendorId", ParseIntPipe) vendorId: number) {
    return this.vendorService.getPublicProfile(vendorId);
  }

  // ─── Admin Endpoints ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: "[Admin] List all vendors" })
  listAll(@Query("page") page?: number, @Query("limit") limit?: number) {
    return this.vendorService.listAll(page, limit);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Patch(":vendorId/admin")
  @ApiOperation({ summary: "[Admin] Verify or activate/deactivate a vendor" })
  @ApiParam({ name: "vendorId", type: Number })
  adminUpdate(
    @Param("vendorId", ParseIntPipe) vendorId: number,
    @Body() dto: AdminUpdateVendorDto,
  ) {
    return this.vendorService.adminUpdate(vendorId, dto);
  }
}
