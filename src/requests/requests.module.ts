import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RequestController } from './controllers/request.controller';
import { GeolocationController } from './controllers/geolocation.controller';
import { RequestService } from './services/request.service';
import { GeolocationService } from './services/geolocation.service';

@Module({
    imports: [PrismaModule],
    controllers: [
        RequestController,
        GeolocationController,
    ],
    providers: [
        RequestService,
        GeolocationService,
    ],
    exports: [
        RequestService,
        GeolocationService,
    ],
})
export class RequestModule { }
