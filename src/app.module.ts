import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { BabiesModule } from "./babies/babies.module";
import { FeedLogsModule } from "./feed-logs/feed-logs.module";
import { DiaperLogsModule } from "./diaper-logs/diaper-logs.module";
import { SleepLogsModule } from "./sleep-logs/sleep-logs.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AuthModule } from "./auth/auth.module";
import { RequestModule } from "./requests/requests.module";
import { StartupModule } from "./startup/startup.module";
import { FirebaseModule } from "./firebase/firebase.module";
import { ContactFormModule } from "./contact-form/contact-form.module";
import { ChatModule } from "./chat/chat.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter";
import { join } from "path";
import { DonationsModule } from "./donations/donations.module";
import { StripeRawBodyMiddleware } from "./donations/stripe-raw.middleware";
import { EcomModule } from "./ecom/ecom.module";
import { MarketplaceModule } from "./marketplace/marketplace.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    BabiesModule,
    FeedLogsModule,
    DiaperLogsModule,
    SleepLogsModule,
    AnalyticsModule,
    AuthModule,
    RequestModule,
    StartupModule,
    FirebaseModule,
    ContactFormModule,
    ChatModule,
    MailerModule.forRoot({
      transport: {
        host: "smtp.gmail.com", // your SMTP host
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"No Reply" <no-momsmilk@gmail.com>',
      },
      template: {
        dir: join(process.cwd(), "src/templates"), // ✅ absolute path
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    DonationsModule,
    EcomModule,
    MarketplaceModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StripeRawBodyMiddleware)
      .forRoutes({ path: "donations/webhook", method: RequestMethod.POST });
  }
}
