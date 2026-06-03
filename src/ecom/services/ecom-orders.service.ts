import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EcomCartService } from "./ecom-cart.service";
import {
  PlaceOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
} from "../dto/order.dto";
import { EcomOrderStatus } from "@prisma/client";
import { VendorService } from "./vendor.service";

const ORDER_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
      variant: { select: { id: true, name: true } },
    },
  },
  user: { select: { id: true, name: true, email: true, phone: true } },
};

@Injectable()
export class EcomOrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: EcomCartService,
    private vendorService: VendorService,
  ) {}

  async placeOrder(userId: number, dto: PlaceOrderDto) {
    const cartItems = await this.cartService.getCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException("Your cart is empty");
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems: {
      productId: number;
      variantId: number | null;
      productName: string;
      variantName: string | null;
      unitPrice: number;
      quantity: number;
    }[] = [];

    for (const item of cartItems) {
      const product = item.product;
      const variant = item.variant;

      const unitPrice = variant ? variant.price : product.basePrice;
      const availableStock = product.hasVariants
        ? (variant?.stock ?? 0)
        : product.stock;

      if (availableStock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}"${variant ? ` (${variant.name})` : ""}. Available: ${availableStock}`,
        );
      }

      totalAmount += unitPrice * item.quantity;
      orderItems.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: product.name,
        variantName: variant?.name ?? null,
        unitPrice,
        quantity: item.quantity,
      });
    }

    // Create order + deduct stock in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.ecomOrder.create({
        data: {
          userId,
          totalAmount,
          notes: dto.notes,
          shippingName: dto.shippingName,
          shippingPhone: dto.shippingPhone,
          shippingAddress: dto.shippingAddress,
          shippingZipcode: dto.shippingZipcode,
          items: { create: orderItems },
        },
        include: ORDER_INCLUDE,
      });

      // Deduct stock
      for (const item of cartItems) {
        if (item.variant) {
          await tx.ecomProductVariant.update({
            where: { id: item.variant.id },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.ecomProduct.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Clear cart
      const cart = await tx.ecomCart.findUnique({ where: { userId } });
      if (cart) {
        await tx.ecomCartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return newOrder;
    });

    return order;
  }

  async getMyOrders(userId: number, query: OrderQueryDto) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId, ...(status && { status }) };

    const [orders, total] = await Promise.all([
      this.prisma.ecomOrder.findMany({
        where,
        skip,
        take: limit,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.ecomOrder.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getOrderDetail(userId: number, orderId: number) {
    const order = await this.prisma.ecomOrder.findFirst({
      where: { id: orderId, userId },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException("Order not found");
    return order;
  }

  async cancelOrder(userId: number, orderId: number) {
    const order = await this.prisma.ecomOrder.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { variant: true, product: true } } },
    });
    if (!order) throw new NotFoundException("Order not found");

    const cancellableStatuses: EcomOrderStatus[] = [
      EcomOrderStatus.PENDING,
      EcomOrderStatus.CONFIRMED,
    ];
    if (!cancellableStatuses.includes(order.status as EcomOrderStatus)) {
      throw new BadRequestException("Order cannot be cancelled at this stage");
    }

    // Restore stock
    await this.prisma.$transaction(async (tx) => {
      await tx.ecomOrder.update({
        where: { id: orderId },
        data: { status: EcomOrderStatus.CANCELLED },
      });

      for (const item of order.items) {
        if (item.variantId) {
          await tx.ecomProductVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.ecomProduct.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    return { success: true, message: "Order cancelled successfully" };
  }

  // ─── Vendor: view incoming orders ─────────────────────────────────────────

  async getVendorOrders(userId: number, query: OrderQueryDto) {
    const vendor = await this.vendorService.getVendorByUserId(userId);
    if (!vendor) throw new ForbiddenException("Vendor profile not found");

    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      items: { some: { product: { vendorId: vendor.id } } },
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      this.prisma.ecomOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          ...ORDER_INCLUDE,
          items: {
            where: { product: { vendorId: vendor.id } },
            include: {
              product: { select: { id: true, name: true } },
              variant: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.ecomOrder.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async updateOrderStatus(
    userId: number,
    orderId: number,
    dto: UpdateOrderStatusDto,
    isAdmin = false,
  ) {
    let order: any;

    if (isAdmin) {
      order = await this.prisma.ecomOrder.findUnique({
        where: { id: orderId },
      });
    } else {
      // Vendor: only orders containing their products
      const vendor = await this.vendorService.getVendorByUserId(userId);
      if (!vendor) throw new ForbiddenException("Vendor profile not found");

      order = await this.prisma.ecomOrder.findFirst({
        where: {
          id: orderId,
          items: { some: { product: { vendorId: vendor.id } } },
        },
      });
    }

    if (!order) throw new NotFoundException("Order not found");

    return this.prisma.ecomOrder.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: ORDER_INCLUDE,
    });
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async adminGetAllOrders(query: OrderQueryDto) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: any = { ...(status && { status }) };

    const [orders, total] = await Promise.all([
      this.prisma.ecomOrder.findMany({
        where,
        skip,
        take: limit,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.ecomOrder.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }
}
