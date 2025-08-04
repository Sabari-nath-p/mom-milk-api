"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const babies_module_1 = require("./babies/babies.module");
const feed_logs_module_1 = require("./feed-logs/feed-logs.module");
const diaper_logs_module_1 = require("./diaper-logs/diaper-logs.module");
const sleep_logs_module_1 = require("./sleep-logs/sleep-logs.module");
const analytics_module_1 = require("./analytics/analytics.module");
const auth_module_1 = require("./auth/auth.module");
const requests_module_1 = require("./requests/requests.module");
const startup_module_1 = require("./startup/startup.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            babies_module_1.BabiesModule,
            feed_logs_module_1.FeedLogsModule,
            diaper_logs_module_1.DiaperLogsModule,
            sleep_logs_module_1.SleepLogsModule,
            analytics_module_1.AnalyticsModule,
            auth_module_1.AuthModule,
            requests_module_1.RequestModule,
            startup_module_1.StartupModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map