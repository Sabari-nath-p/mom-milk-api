import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RequestModule } from "../requests/requests.module";

// Services
import { VendorService } from "./services/vendor.service";
import { EcomProductsService } from "./services/ecom-products.service";
import { EcomCartService } from "./services/ecom-cart.service";
import { EcomOrdersService } from "./services/ecom-orders.service";
import { EcomReviewsService } from "./services/ecom-reviews.service";

// Controllers
import { VendorController } from "./controllers/vendor.controller";
import { EcomProductsController } from "./controllers/ecom-products.controller";
import { EcomCartController } from "./controllers/ecom-cart.controller";
import { EcomOrdersController } from "./controllers/ecom-orders.controller";
import { EcomReviewsController } from "./controllers/ecom-reviews.controller";

@Module({
  imports: [PrismaModule, RequestModule],
  controllers: [
    VendorController,
    EcomProductsController,
    EcomCartController,
    EcomOrdersController,
    EcomReviewsController,
  ],
  providers: [
    VendorService,
    EcomProductsService,
    EcomCartService,
    EcomOrdersService,
    EcomReviewsService,
  ],
  exports: [VendorService],
})
export class EcomModule {}
