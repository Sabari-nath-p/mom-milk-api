import { Module } from '@nestjs/common';
import { FeedLogsService } from './feed-logs.service';
import { FeedLogsController } from './feed-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FeedLogsController],
    providers: [FeedLogsService],
    exports: [FeedLogsService],
})
export class FeedLogsModule { }
