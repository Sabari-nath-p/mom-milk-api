import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RequestModule } from "../requests/requests.module";
import { ChatModule } from "../chat/chat.module";
import { MarketplaceService } from "./services/marketplace.service";
import { MarketplaceController } from "./controllers/marketplace.controller";

@Module({
  imports: [PrismaModule, RequestModule, ChatModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
})
export class MarketplaceModule {}
