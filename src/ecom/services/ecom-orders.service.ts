import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { EcomCartService } from "./ecom-cart.service";
import {
  PlaceOrderDto,
  UpdateOrderStatusDto,
  UpdateOrderTrackingDto,
  OrderQueryDto,
  VendorOrderQueryDto,
} from "../dto/order.dto";
import { EcomOrderStatus } from "@prisma/client";
import { VendorService } from "./vendor.service";
import { MailService } from "../../mail/mail.service";
import { FirebaseService } from "../../firebase/firebase.service";

interface StoredTrackingHistoryEntry {
  status: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  timestamp: string;
  updatedBy: string;
}

interface StoredTrackingData {
  trackingNumber?: string | null;
  carrier?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  trackingNotes?: string | null;
  history?: StoredTrackingHistoryEntry[];
}

interface OrderNotesContainer {
  orderNotes?: string | null;
  tracking?: StoredTrackingData;
}

const ORDER_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          vendorId: true,
          images: {
            select: { id: true, url: true, isPrimary: true },
            orderBy: { isPrimary: "desc" as const },
          },
        },
      },
      variant: { select: { id: true, name: true, price: true } },
    },
  },
  user: { select: { id: true, name: true, email: true, phone: true } },
};

@Injectable()
export class EcomOrdersService {
  private readonly logger = new Logger(EcomOrdersService.name);

  constructor(
    private prisma: PrismaService,
    private cartService: EcomCartService,
    private vendorService: VendorService,
    private mailService: MailService,
    private firebaseService: FirebaseService,
  ) {}

  // ─── Tracking Helpers ──────────────────────────────────────────────────────

  private parseOrderNotes(rawNotes: string | null): {
    customerNotes: string | null;
    tracking: StoredTrackingData;
  } {
    const defaultTracking: StoredTrackingData = {
      trackingNumber: null,
      carrier: null,
      trackingUrl: null,
      estimatedDelivery: null,
      shippedAt: null,
      deliveredAt: null,
      trackingNotes: null,
      history: [],
    };

    if (!rawNotes) {
      return { customerNotes: null, tracking: defaultTracking };
    }

    try {
      const parsed = JSON.parse(rawNotes);
      if (parsed && typeof parsed === "object" && parsed.tracking) {
        return {
          customerNotes: parsed.orderNotes ?? null,
          tracking: {
            trackingNumber: parsed.tracking.trackingNumber ?? null,
            carrier: parsed.tracking.carrier ?? null,
            trackingUrl: parsed.tracking.trackingUrl ?? null,
            estimatedDelivery: parsed.tracking.estimatedDelivery ?? null,
            shippedAt: parsed.tracking.shippedAt ?? null,
            deliveredAt: parsed.tracking.deliveredAt ?? null,
            trackingNotes: parsed.tracking.trackingNotes ?? null,
            history: Array.isArray(parsed.tracking.history)
              ? parsed.tracking.history
              : [],
          },
        };
      }
    } catch {
      // rawNotes is standard customer plain text note
    }

    return {
      customerNotes: rawNotes,
      tracking: defaultTracking,
    };
  }

  private serializeOrderNotes(
    customerNotes: string | null,
    tracking: StoredTrackingData,
  ): string {
    const payload: OrderNotesContainer = {
      orderNotes: customerNotes,
      tracking,
    };
    return JSON.stringify(payload);
  }

  private buildTrackingTimeline(order: any, tracking: StoredTrackingData) {
    const status = order.status as EcomOrderStatus;
    const createdAt = order.createdAt
      ? new Date(order.createdAt).toISOString()
      : null;

    const getHistoryTime = (st: string) => {
      const entry = (tracking.history || []).find((h) => h.status === st);
      return entry ? entry.timestamp : null;
    };

    const statusOrder: EcomOrderStatus[] = [
      EcomOrderStatus.PENDING,
      EcomOrderStatus.CONFIRMED,
      EcomOrderStatus.PROCESSING,
      EcomOrderStatus.SHIPPED,
      EcomOrderStatus.DELIVERED,
    ];

    const currentIdx = statusOrder.indexOf(status);

    return [
      {
        stage: "ORDER_PLACED",
        title: "Order Placed",
        completed: true,
        timestamp: createdAt,
      },
      {
        stage: "CONFIRMED",
        title: "Order Confirmed",
        completed: currentIdx >= 1,
        timestamp:
          getHistoryTime("CONFIRMED") ?? (currentIdx >= 1 ? createdAt : null),
      },
      {
        stage: "PROCESSING",
        title: "Processing & Packed",
        completed: currentIdx >= 2,
        timestamp:
          getHistoryTime("PROCESSING") ??
          (currentIdx >= 2 ? (tracking.shippedAt ?? createdAt) : null),
      },
      {
        stage: "SHIPPED",
        title: "Shipped / In Transit",
        completed: currentIdx >= 3,
        timestamp: tracking.shippedAt ?? getHistoryTime("SHIPPED"),
      },
      {
        stage: "DELIVERED",
        title: "Delivered",
        completed: currentIdx >= 4,
        timestamp: tracking.deliveredAt ?? getHistoryTime("DELIVERED"),
      },
    ];
  }

  private formatOrderResponse(order: any, vendorId?: number) {
    const { customerNotes, tracking } = this.parseOrderNotes(order.notes);
    const timeline = this.buildTrackingTimeline(order, tracking);

    const vendorItems = vendorId
      ? (order.items || []).filter(
          (item: any) => item.product?.vendorId === vendorId,
        )
      : order.items || [];

    const formattedItems = vendorItems.map((item: any) => ({
      ...item,
      subtotal: +(item.unitPrice * item.quantity).toFixed(2),
    }));

    const vendorSubtotal = +formattedItems
      .reduce((sum: number, it: any) => sum + (it.subtotal || 0), 0)
      .toFixed(2);

    const vendorItemCount = formattedItems.reduce(
      (count: number, it: any) => count + (it.quantity || 0),
      0,
    );

    return {
      ...order,
      notes: customerNotes,
      items: formattedItems,
      vendorSubtotal,
      vendorItemCount,
      tracking: {
        trackingNumber: tracking.trackingNumber,
        carrier: tracking.carrier,
        trackingUrl: tracking.trackingUrl,
        status: order.status,
        estimatedDelivery: tracking.estimatedDelivery,
        shippedAt: tracking.shippedAt,
        deliveredAt: tracking.deliveredAt,
        trackingNotes: tracking.trackingNotes,
        history: tracking.history || [],
        timeline,
      },
    };
  }

  // ─── Buyer ────────────────────────────────────────────────────────────────

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

    // Initialize tracking history
    const initialTracking: StoredTrackingData = {
      trackingNumber: null,
      carrier: null,
      trackingUrl: null,
      estimatedDelivery: null,
      shippedAt: null,
      deliveredAt: null,
      trackingNotes: null,
      history: [
        {
          status: EcomOrderStatus.PENDING,
          carrier: null,
          trackingNumber: null,
          notes: "Order placed by customer",
          timestamp: new Date().toISOString(),
          updatedBy: "BUYER",
        },
      ],
    };

    const notesPayload = this.serializeOrderNotes(
      dto.notes || null,
      initialTracking,
    );

    // Create order + deduct stock in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.ecomOrder.create({
        data: {
          userId,
          totalAmount,
          notes: notesPayload,
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

    return this.formatOrderResponse(order);
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
      data: orders.map((order) => this.formatOrderResponse(order)),
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
    return this.formatOrderResponse(order);
  }

  async getBuyerOrderTracking(userId: number, orderId: number) {
    const order = await this.prisma.ecomOrder.findFirst({
      where: { id: orderId, userId },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException("Order not found");

    const formatted = this.formatOrderResponse(order);
    return {
      orderId: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      shippingZipcode: order.shippingZipcode,
      createdAt: order.createdAt,
      tracking: formatted.tracking,
    };
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

    const { customerNotes, tracking } = this.parseOrderNotes(order.notes);
    tracking.history = tracking.history || [];
    tracking.history.push({
      status: EcomOrderStatus.CANCELLED,
      notes: "Order cancelled by customer",
      timestamp: new Date().toISOString(),
      updatedBy: "BUYER",
    });
    const updatedNotes = this.serializeOrderNotes(customerNotes, tracking);

    // Restore stock
    await this.prisma.$transaction(async (tx) => {
      await tx.ecomOrder.update({
        where: { id: orderId },
        data: {
          status: EcomOrderStatus.CANCELLED,
          notes: updatedNotes,
        },
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

  // ─── Vendor: View Incoming Order Requests ──────────────────────────────────

  async getVendorOrders(userId: number, query: VendorOrderQueryDto) {
    const vendor = await this.vendorService.getVendorByUserId(userId);
    if (!vendor) throw new ForbiddenException("Vendor profile not found");

    const { status, search, startDate, endDate, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      items: { some: { product: { vendorId: vendor.id } } },
      ...(status && { status }),
    };

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Search filter across order ID, buyer, and shipping fields
    if (search && search.trim().length > 0) {
      const term = search.trim();
      const numericId = parseInt(term, 10);
      const orClauses: any[] = [
        { shippingName: { contains: term } },
        { shippingPhone: { contains: term } },
        { shippingAddress: { contains: term } },
        { shippingZipcode: { contains: term } },
        { user: { name: { contains: term } } },
        { user: { email: { contains: term } } },
        { user: { phone: { contains: term } } },
      ];
      if (!isNaN(numericId)) {
        orClauses.push({ id: numericId });
      }
      where.AND = [{ OR: orClauses }];
    }

    const [orders, total] = await Promise.all([
      this.prisma.ecomOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            where: { product: { vendorId: vendor.id } },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  basePrice: true,
                  vendorId: true,
                  images: {
                    select: { id: true, url: true, isPrimary: true },
                    orderBy: { isPrimary: "desc" },
                  },
                },
              },
              variant: { select: { id: true, name: true, price: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.ecomOrder.count({ where }),
    ]);

    return {
      data: orders.map((order) => this.formatOrderResponse(order, vendor.id)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  // ─── Vendor: Order Details Page Endpoint ──────────────────────────────────

  async getVendorOrderDetail(userId: number, orderId: number) {
    const vendor = await this.vendorService.getVendorByUserId(userId);
    if (!vendor) throw new ForbiddenException("Vendor profile not found");

    // Fetch order with all items to inspect
    const order = await this.prisma.ecomOrder.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePhoto: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                basePrice: true,
                stock: true,
                vendorId: true,
                images: {
                  select: { id: true, url: true, isPrimary: true },
                  orderBy: { isPrimary: "desc" },
                },
                category: { select: { id: true, name: true } },
              },
            },
            variant: { select: { id: true, name: true, sku: true, price: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Verify this vendor owns items in this order
    const vendorHasItems = order.items.some(
      (item) => item.product?.vendorId === vendor.id,
    );
    if (!vendorHasItems) {
      throw new ForbiddenException(
        "You do not have permission to view this order",
      );
    }

    const isMultiVendorOrder = order.items.some(
      (item) => item.product?.vendorId !== vendor.id,
    );

    const formatted = this.formatOrderResponse(order, vendor.id);

    return {
      ...formatted,
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName,
        zipcode: vendor.zipcode,
      },
      isMultiVendorOrder,
    };
  }

  // ─── Vendor / Admin: Manually Update Order Tracking ────────────────────────

  async updateOrderTracking(
    userId: number,
    orderId: number,
    dto: UpdateOrderTrackingDto,
    isAdmin = false,
  ) {
    let vendor: any = null;

    if (!isAdmin) {
      vendor = await this.vendorService.getVendorByUserId(userId);
      if (!vendor) throw new ForbiddenException("Vendor profile not found");
    }

    const order = await this.prisma.ecomOrder.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            fcmToken: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                vendorId: true,
                images: {
                  select: { id: true, url: true, isPrimary: true },
                  orderBy: { isPrimary: "desc" },
                },
              },
            },
            variant: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!order) throw new NotFoundException("Order not found");

    if (!isAdmin) {
      const hasVendorProducts = order.items.some(
        (item) => item.product?.vendorId === vendor.id,
      );
      if (!hasVendorProducts) {
        throw new ForbiddenException(
          "You do not have permission to update tracking for this order",
        );
      }
    }

    if (
      order.status === EcomOrderStatus.CANCELLED ||
      order.status === EcomOrderStatus.REFUNDED
    ) {
      throw new BadRequestException(
        `Cannot update tracking for an order that is ${order.status}`,
      );
    }

    const { customerNotes, tracking } = this.parseOrderNotes(order.notes);

    // Apply tracking updates
    if (dto.trackingNumber !== undefined) {
      tracking.trackingNumber = dto.trackingNumber;
    }
    if (dto.carrier !== undefined) {
      tracking.carrier = dto.carrier;
    }
    if (dto.trackingUrl !== undefined) {
      tracking.trackingUrl = dto.trackingUrl;
    }
    if (dto.estimatedDelivery !== undefined) {
      tracking.estimatedDelivery = dto.estimatedDelivery;
    }
    if (dto.shippedAt !== undefined) {
      tracking.shippedAt = dto.shippedAt;
    }
    if (dto.deliveredAt !== undefined) {
      tracking.deliveredAt = dto.deliveredAt;
    }
    if (dto.trackingNotes !== undefined) {
      tracking.trackingNotes = dto.trackingNotes;
    }

    // Determine new status
    let newStatus = dto.status || (order.status as EcomOrderStatus);

    // If tracking number was provided and order is in PENDING/CONFIRMED, auto-promote to SHIPPED
    if (
      !dto.status &&
      dto.trackingNumber &&
      (order.status === EcomOrderStatus.PENDING ||
        order.status === EcomOrderStatus.CONFIRMED ||
        order.status === EcomOrderStatus.PROCESSING)
    ) {
      newStatus = EcomOrderStatus.SHIPPED;
    }

    // Automatically set shippedAt / deliveredAt dates if transitioning
    if (newStatus === EcomOrderStatus.SHIPPED && !tracking.shippedAt) {
      tracking.shippedAt = new Date().toISOString();
    }
    if (newStatus === EcomOrderStatus.DELIVERED && !tracking.deliveredAt) {
      tracking.deliveredAt = new Date().toISOString();
    }

    // Append to tracking history
    tracking.history = tracking.history || [];
    tracking.history.push({
      status: newStatus,
      carrier: tracking.carrier,
      trackingNumber: tracking.trackingNumber,
      notes:
        dto.trackingNotes ||
        `Status updated to ${newStatus}${tracking.carrier ? ` via ${tracking.carrier}` : ""}`,
      timestamp: new Date().toISOString(),
      updatedBy: isAdmin
        ? "ADMIN"
        : `VENDOR (${vendor?.storeName || "Seller"})`,
    });

    const serializedNotes = this.serializeOrderNotes(customerNotes, tracking);

    const updatedOrder = await this.prisma.ecomOrder.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        notes: serializedNotes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            fcmToken: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                vendorId: true,
                images: {
                  select: { id: true, url: true, isPrimary: true },
                  orderBy: { isPrimary: "desc" },
                },
              },
            },
            variant: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Notify buyer asynchronously
    this.notifyBuyerOfTrackingUpdate(
      updatedOrder,
      newStatus,
      tracking,
      vendor?.storeName,
    ).catch((err) => {
      this.logger.error("Failed to notify buyer of tracking update:", err);
    });

    return this.formatOrderResponse(updatedOrder, vendor?.id);
  }

  /**
   * Helper to send tracking notification to buyer via Email and Push Notification
   */
  private async notifyBuyerOfTrackingUpdate(
    order: any,
    status: EcomOrderStatus,
    tracking: StoredTrackingData,
    storeName?: string,
  ): Promise<void> {
    if (!order.user) return;

    const buyerName = order.user.name || "Valued Customer";
    const buyerEmail = order.user.email;
    const buyerFcmToken = order.user.fcmToken;

    const trackingInfo = tracking.trackingNumber
      ? `Tracking Number: ${tracking.trackingNumber} (${tracking.carrier || "Courier"})`
      : "";

    // Send email
    if (buyerEmail) {
      try {
        await this.mailService.sendEmail({
          to: buyerEmail,
          subject: `Order #${order.id} Status Update: ${status}`,
          html: `
            <h2>Hello ${buyerName},</h2>
            <p>Your order <strong>#${order.id}</strong> has been updated.</p>
            <p><strong>Status:</strong> ${status}</p>
            ${storeName ? `<p><strong>Seller:</strong> ${storeName}</p>` : ""}
            ${
              tracking.carrier
                ? `<p><strong>Carrier:</strong> ${tracking.carrier}</p>`
                : ""
            }
            ${
              tracking.trackingNumber
                ? `<p><strong>Tracking Number:</strong> ${tracking.trackingNumber}</p>`
                : ""
            }
            ${
              tracking.trackingUrl
                ? `<p><a href="${tracking.trackingUrl}" style="background:#2563eb;color:#fff;padding:8px 16px;text-decoration:none;border-radius:4px;display:inline-block;">Track Your Order</a></p>`
                : ""
            }
            ${
              tracking.estimatedDelivery
                ? `<p><strong>Estimated Delivery:</strong> ${new Date(tracking.estimatedDelivery).toLocaleDateString()}</p>`
                : ""
            }
            ${
              tracking.trackingNotes
                ? `<p><strong>Note:</strong> ${tracking.trackingNotes}</p>`
                : ""
            }
            <br>
            <p>Thank you for shopping with Mom's Milk!</p>
          `,
        });
      } catch (err) {
        this.logger.warn(`Failed to send tracking email to ${buyerEmail}:`, err);
      }
    }

    // Send push notification
    if (buyerFcmToken) {
      try {
        await this.firebaseService.sendNotification({
          token: buyerFcmToken,
          notification: {
            title: `Order #${order.id}: ${status}`,
            body: tracking.trackingNumber
              ? `Your package has been updated with tracking #${tracking.trackingNumber}`
              : `Your order status is now ${status}`,
          },
          data: {
            type: "ORDER_TRACKING_UPDATE",
            orderId: order.id.toString(),
            status,
            trackingNumber: tracking.trackingNumber || "",
          },
        });
      } catch (err) {
        this.logger.warn(
          `Failed to send FCM push to user ${order.user.id}:`,
          err,
        );
      }
    }
  }

  // ─── Vendor: Orders Summary / Dashboard Stats ───────────────────────────────

  async getVendorOrderSummary(userId: number) {
    const vendor = await this.vendorService.getVendorByUserId(userId);
    if (!vendor) throw new ForbiddenException("Vendor profile not found");

    // Fetch all orders containing products for this vendor
    const orders = await this.prisma.ecomOrder.findMany({
      where: {
        items: { some: { product: { vendorId: vendor.id } } },
      },
      include: {
        items: {
          where: { product: { vendorId: vendor.id } },
          select: { unitPrice: true, quantity: true },
        },
      },
    });

    let pendingOrders = 0;
    let confirmedOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;

    for (const ord of orders) {
      switch (ord.status) {
        case EcomOrderStatus.PENDING:
          pendingOrders++;
          break;
        case EcomOrderStatus.CONFIRMED:
          confirmedOrders++;
          break;
        case EcomOrderStatus.PROCESSING:
          processingOrders++;
          break;
        case EcomOrderStatus.SHIPPED:
          shippedOrders++;
          break;
        case EcomOrderStatus.DELIVERED:
          deliveredOrders++;
          break;
        case EcomOrderStatus.CANCELLED:
        case EcomOrderStatus.REFUNDED:
          cancelledOrders++;
          break;
      }

      // Add revenue if not cancelled or refunded
      if (
        ord.status !== EcomOrderStatus.CANCELLED &&
        ord.status !== EcomOrderStatus.REFUNDED
      ) {
        const orderRev = ord.items.reduce(
          (sum, it) => sum + it.unitPrice * it.quantity,
          0,
        );
        totalRevenue += orderRev;
      }
    }

    return {
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: +totalRevenue.toFixed(2),
    };
  }

  // ─── Update Order Status (General) ─────────────────────────────────────────

  async updateOrderStatus(
    userId: number,
    orderId: number,
    dto: UpdateOrderStatusDto,
    isAdmin = false,
  ) {
    // Delegate to updateOrderTracking with just the status
    return this.updateOrderTracking(userId, orderId, { status: dto.status }, isAdmin);
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
      data: orders.map((order) => this.formatOrderResponse(order)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }
}
