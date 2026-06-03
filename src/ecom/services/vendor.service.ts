import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateVendorDto,
  UpdateVendorDto,
  AdminUpdateVendorDto,
} from "../dto/vendor.dto";

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async register(userId: number, dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException("You already have a vendor profile");
    }

    return this.prisma.vendor.create({
      data: { userId, ...dto },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async getMyProfile(userId: number) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        _count: { select: { products: true } },
      },
    });
    if (!vendor) throw new NotFoundException("Vendor profile not found");
    return vendor;
  }

  async getPublicProfile(vendorId: number) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
    });
    if (!vendor) throw new NotFoundException("Vendor not found");
    return vendor;
  }

  async update(userId: number, dto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException("Vendor profile not found");

    return this.prisma.vendor.update({
      where: { userId },
      data: dto,
    });
  }

  async adminUpdate(vendorId: number, dto: AdminUpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) throw new NotFoundException("Vendor not found");

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: dto,
    });
  }

  async listAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.vendor.count(),
    ]);
    return {
      data: vendors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async ensureVendorOwnsProduct(userId: number, productId: number) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor)
      throw new ForbiddenException("You are not a registered vendor");

    const product = await this.prisma.ecomProduct.findFirst({
      where: { id: productId, vendorId: vendor.id },
    });
    if (!product)
      throw new ForbiddenException("Product not found or access denied");

    return { vendor, product };
  }

  async getVendorByUserId(userId: number) {
    return this.prisma.vendor.findUnique({ where: { userId } });
  }
}
