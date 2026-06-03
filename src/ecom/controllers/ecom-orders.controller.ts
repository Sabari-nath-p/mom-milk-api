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
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../../auth/guards/admin.guard";
import { EcomOrdersService } from "../services/ecom-orders.service";
import {
  PlaceOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
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
  @ApiOperation({ summary: "Get order detail" })
  @ApiParam({ name: "orderId", type: Number })
  getOrderDetail(
    @Request() req,
    @Param("orderId", ParseIntPipe) orderId: number,
  ) {
    return this.ordersService.getOrderDetail(req.user.id, orderId);
  }

  @Patch("my/:orderId/cancel")
  @ApiOperation({ summary: "Cancel an order (PENDING or CONFIRMED only)" })
  @ApiParam({ name: "orderId", type: Number })
  cancelOrder(@Request() req, @Param("orderId", ParseIntPipe) orderId: number) {
    return this.ordersService.cancelOrder(req.user.id, orderId);
  }

  // ─── Vendor ───────────────────────────────────────────────────────────────

  @Get("vendor")
  @ApiOperation({ summary: "[Vendor] Get incoming orders for my products" })
  getVendorOrders(@Request() req, @Query() query: OrderQueryDto) {
    return this.ordersService.getVendorOrders(req.user.id, query);
  }

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
