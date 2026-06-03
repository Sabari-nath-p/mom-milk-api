import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RequestModule } from "../requests/requests.module";
import { MarketplaceService } from "./services/marketplace.service";
import { MarketplaceController } from "./controllers/marketplace.controller";

@Module({
  imports: [PrismaModule, RequestModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
})
export class MarketplaceModule {}
