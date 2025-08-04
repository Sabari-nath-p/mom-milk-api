import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { BabiesModule } from './babies/babies.module';
import { FeedLogsModule } from './feed-logs/feed-logs.module';
import { DiaperLogsModule } from './diaper-logs/diaper-logs.module';
import { SleepLogsModule } from './sleep-logs/sleep-logs.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { RequestModule } from './requests/requests.module';
import { StartupModule } from './startup/startup.module';

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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
