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
import { EcomOrdersService } from "../services/ecom-orders.service";
import {
  PlaceOrderDto,
  UpdateOrderStatusDto,
  UpdateOrderTrackingDto,
  OrderQueryDto,
  VendorOrderQueryDto,
  VendorOrderSummaryDto,
  OrderTrackingDetailDto,
} from "../dto/order.dto";

@ApiTags("E-Commerce / Orders")
@Controller("ecom/orders")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EcomOrdersController {
  constructor(private readonly ordersService: EcomOrdersService) {}

  // ─── Buyer ────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: "Place an order from cart (checkout)" })
  placeOrder(@Request() req, @Body() dto: PlaceOrderDto) {
    return this.ordersService.placeOrder(req.user.id, dto);
  }

  @Get("my")
  @ApiOperation({ summary: "Get my order history" })
  getMyOrders(@Request() req, @Query() query: OrderQueryDto) {
    return this.ordersService.getMyOrders(req.user.id, query);
  }

  @Get("my/:orderId")
  @ApiOperation({ summary: "Get order detail for customer" })
  @ApiParam({ name: "orderId", type: Number })
  getOrderDetail(
    @Request() req,
    @Param("orderId", ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderDetail(req.user.id, orderId);
  }

  @Get("my/:orderId/tracking")
  @ApiOperation({ summary: "Track customer order with milestone timeline" })
  @ApiParam({ name: "orderId", type: Number })
  @ApiResponse({
    status: 200,
    description: "Tracking information and milestone timeline",
    type: OrderTrackingDetailDto,
  })
  getBuyerOrderTracking(
    @Request() req,
    @Param("orderId", ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getBuyerOrderTracking(req.user.id, orderId);
  }

  @Patch("my/:orderId/cancel")
  @ApiOperation({ summary: "Cancel an order (PENDING or CONFIRMED only)" })
  @ApiParam({ name: "orderId", type: Number })
  cancelOrder(@Request() req, @Param("orderId", ParseIntPipe) orderId: number) {
    return this.ordersService.cancelOrder(req.user.id, orderId);
  }

  // ─── Vendor: Incoming Orders, Tracking, and Details ───────────────────────

  @UseGuards(VendorGuard)
  @Get("vendor/summary")
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

  @UseGuards(VendorGuard)
  @Get("vendor")
  @ApiOperation({
    summary: "[Vendor] See order requests for products sold by this vendor",
    description:
      "Lists incoming order requests with customer contact info, vendor items, vendor subtotal, search, date filtering, and tracking status.",
  })
  getVendorOrders(@Request() req, @Query() query: VendorOrderQueryDto) {
    return this.ordersService.getVendorOrders(req.user.id, query);
  }

  @UseGuards(VendorGuard)
  @Get("vendor/:orderId")
  @ApiOperation({
    summary: "[Vendor] View full order details page for an order request",
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

  @UseGuards(VendorGuard)
  @Patch("vendor/:orderId/tracking")
  @ApiOperation({
    summary: "[Vendor] Manually update order tracking and dispatch details",
    description:
      "Allows the vendor to manually assign courier name, tracking number, tracking URL, estimated delivery date, dispatch notes, and advance status (e.g. to SHIPPED or DELIVERED). Automatically notifies the customer via email and push notification.",
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

  @UseGuards(VendorGuard)
  @Patch("vendor/:orderId/status")
  @ApiOperation({ summary: "[Vendor] Update order status" })
  @ApiParam({ name: "orderId", type: Number })
  updateOrderStatus(
    @Request() req,
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      req.user.id,
      orderId,
      dto,
      false,
    );
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  @UseGuards(AdminGuard)
  @Get("admin")
  @ApiOperation({ summary: "[Admin] List all orders" })
  adminGetAllOrders(@Query() query: OrderQueryDto) {
    return this.ordersService.adminGetAllOrders(query);
  }

  @UseGuards(AdminGuard)
  @Patch("admin/:orderId/tracking")
  @ApiOperation({ summary: "[Admin] Update tracking for any order" })
  @ApiParam({ name: "orderId", type: Number })
  adminUpdateTracking(
    @Request() req,
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderTrackingDto,
  ) {
    return this.ordersService.updateOrderTracking(
      req.user.id,
      orderId,
      dto,
      true,
    );
  }

  @UseGuards(AdminGuard)
  @Patch("admin/:orderId/status")
  @ApiOperation({ summary: "[Admin] Update any order status" })
  @ApiParam({ name: "orderId", type: Number })
  adminUpdateStatus(
    @Request() req,
    @Param("orderId", ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      req.user.id,
      orderId,
      dto,
      true,
    );
  }
}
