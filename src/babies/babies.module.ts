import { Module } from '@nestjs/common';
import { BabiesService } from './babies.service';
import { BabiesController } from './babies.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [BabiesController],
    providers: [BabiesService],
    exports: [BabiesService],
})
export class BabiesModule { }
