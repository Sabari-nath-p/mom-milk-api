import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule { }
