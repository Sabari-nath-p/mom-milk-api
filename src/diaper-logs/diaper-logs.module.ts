import { Module } from '@nestjs/common';
import { DiaperLogsService } from './diaper-logs.service';
import { DiaperLogsController } from './diaper-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DiaperLogsController],
    providers: [DiaperLogsService],
    exports: [DiaperLogsService],
})
export class DiaperLogsModule { }
