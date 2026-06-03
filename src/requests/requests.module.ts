import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { FirebaseModule } from "../firebase/firebase.module";
import { MailModule } from "../mail/mail.module";
import { ChatModule } from "../chat/chat.module";
import { RequestController } from "./controllers/request.controller";
import { GeolocationController } from "./controllers/geolocation.controller";
import { RequestService } from "./services/request.service";
import { GeolocationService } from "./services/geolocation.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    PrismaModule,
    FirebaseModule,
    MailModule,
    ChatModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
    }),
  ],
  controllers: [RequestController, GeolocationController],
  providers: [RequestService, GeolocationService],
  exports: [RequestService, GeolocationService],
})
export class RequestModule {}
