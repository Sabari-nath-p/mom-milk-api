import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class VendorGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new ForbiddenException(
        "Access restricted to registered vendors only. Please register as a vendor.",
      );
    }

    if (!vendor.isActive) {
      throw new ForbiddenException(
        "Your vendor account has been deactivated. Please contact support.",
      );
    }

    request.vendor = vendor;
    return true;
  }
}
