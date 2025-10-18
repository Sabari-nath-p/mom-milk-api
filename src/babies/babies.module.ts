import { Module } from '@nestjs/common';
import { BabiesService } from './babies.service';
import { BabiesAnalyticsService } from './babies-analytics.service';
import { BabiesController } from './babies.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [BabiesController],
    providers: [BabiesService, BabiesAnalyticsService],
    exports: [BabiesService, BabiesAnalyticsService],
})
export class BabiesModule { }
