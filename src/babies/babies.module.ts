import { Module } from "@nestjs/common";
import { BabiesService } from "./babies.service";
import { BabiesAnalyticsService } from "./babies-analytics.service";
import { BabiesController } from "./babies.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
    }),
  ],
  controllers: [BabiesController],
  providers: [BabiesService, BabiesAnalyticsService],
  exports: [BabiesService, BabiesAnalyticsService],
})
export class BabiesModule {}
