import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { UserType } from "@prisma/client";
import {
  CreateVendorDto,
  UpdateVendorDto,
  AdminUpdateVendorDto,
  RegisterVendorDto,
  UpdateVendorPasswordDto,
} from "../dto/vendor.dto";
import { PasswordUtil } from "../../auth/utils/password.util";

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Direct public vendor registration with owner details, password, and store info.
   * Creates or links User, hashes password, creates Vendor profile, and issues JWT token.
   */
  async directRegister(dto: RegisterVendorDto) {
    const {
      name,
      email,
      phone,
      password,
      storeName,
      description,
      logoUrl,
      zipcode,
      address,
    } = dto;

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { vendorProfile: true },
    });

    if (user?.vendorProfile) {
      throw new ConflictException(
        "A vendor account already exists with this email address. Please log in.",
      );
    }

    // If user does not exist, create the user
    if (!user) {
      user = (await this.prisma.user.create({
        data: {
          name,
          email,
          phone,
          zipcode,
          userType: UserType.BUYER,
          isNew: false,
          isActive: true,
          lastLoginAt: new Date(),
        },
        include: { vendorProfile: true },
      })) as any;
    }

    // Hash the password
    const passwordHash = PasswordUtil.hashPassword(password);
    const serializedDesc = PasswordUtil.serializeVendorDescription(
      description,
      passwordHash,
    );

    // Create the vendor profile
    const vendor = await this.prisma.vendor.create({
      data: {
        userId: user.id,
        storeName,
        description: serializedDesc,
        logoUrl,
        zipcode,
        address,
        isActive: true,
        isVerified: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
      },
    });

    // Generate JWT access token for immediate login
    const payload = {
      email: user.email,
      sub: user.id,
      userType: user.userType,
      vendorId: vendor.id,
      isVendor: true,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: "Vendor registered successfully",
      authData: {
        accessToken,
        user: vendor.user,
        vendor: PasswordUtil.sanitizeVendor(vendor),
      },
    };
  }

  /**
   * Authenticated user upgrading to vendor.
   */
  async register(userId: number, dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException("You already have a vendor profile");
    }

    let serializedDesc = dto.description ?? null;
    if (dto.password) {
      const passwordHash = PasswordUtil.hashPassword(dto.password);
      serializedDesc = PasswordUtil.serializeVendorDescription(
        dto.description,
        passwordHash,
      );
    }

    const vendor = await this.prisma.vendor.create({
      data: {
        userId,
        storeName: dto.storeName,
        description: serializedDesc,
        logoUrl: dto.logoUrl,
        zipcode: dto.zipcode,
        address: dto.address,
        isActive: true,
        isVerified: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userType: true,
          },
        },
      },
    });

    return PasswordUtil.sanitizeVendor(vendor);
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
    return PasswordUtil.sanitizeVendor(vendor);
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
    return PasswordUtil.sanitizeVendor(vendor);
  }

  async update(userId: number, dto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException("Vendor profile not found");

    const updateData: any = {};
    if (dto.storeName !== undefined) updateData.storeName = dto.storeName;
    if (dto.logoUrl !== undefined) updateData.logoUrl = dto.logoUrl;
    if (dto.zipcode !== undefined) updateData.zipcode = dto.zipcode;
    if (dto.address !== undefined) updateData.address = dto.address;

    // Handle password and description updates
    if (dto.description !== undefined || dto.password !== undefined) {
      const { description: currentBio, passwordHash: currentHash } =
        PasswordUtil.parseVendorDescription(vendor.description);

      const newBio = dto.description !== undefined ? dto.description : currentBio;
      const newHash = dto.password
        ? PasswordUtil.hashPassword(dto.password)
        : currentHash;

      updateData.description = PasswordUtil.serializeVendorDescription(
        newBio,
        newHash,
      );
    }

    const updated = await this.prisma.vendor.update({
      where: { userId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return PasswordUtil.sanitizeVendor(updated);
  }

  /**
   * Update or set a vendor password for password login.
   */
  async updatePassword(userId: number, dto: UpdateVendorPasswordDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new NotFoundException("Vendor profile not found");

    const { description, passwordHash } = PasswordUtil.parseVendorDescription(
      vendor.description,
    );

    // If an existing password was set, verify the current password
    const storedHash = (vendor as any).password || passwordHash;
    if (storedHash) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          "Current password is required to change password",
        );
      }
      const isCurrentValid = PasswordUtil.verifyPassword(
        dto.currentPassword,
        storedHash,
      );
      if (!isCurrentValid) {
        throw new UnauthorizedException("Current password is incorrect");
      }
    }

    const newHash = PasswordUtil.hashPassword(dto.newPassword);
    const serializedDesc = PasswordUtil.serializeVendorDescription(
      description,
      newHash,
    );

    await this.prisma.vendor.update({
      where: { userId },
      data: { description: serializedDesc },
    });

    return {
      success: true,
      message: "Vendor password updated successfully",
    };
  }

  async adminUpdate(vendorId: number, dto: AdminUpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });
    if (!vendor) throw new NotFoundException("Vendor not found");

    const updated = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: dto,
    });

    return PasswordUtil.sanitizeVendor(updated);
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
      data: vendors.map((v) => PasswordUtil.sanitizeVendor(v)),
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
