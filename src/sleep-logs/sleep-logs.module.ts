import { Module } from '@nestjs/common';
import { SleepLogsService } from './sleep-logs.service';
import { SleepLogsController } from './sleep-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SleepLogsController],
    providers: [SleepLogsService],
    exports: [SleepLogsService],
})
export class SleepLogsModule { }
