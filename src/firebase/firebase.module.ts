import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [FirebaseController],
    providers: [FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule { }
