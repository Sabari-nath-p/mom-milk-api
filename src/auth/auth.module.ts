import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        MailModule,
        FirebaseModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
