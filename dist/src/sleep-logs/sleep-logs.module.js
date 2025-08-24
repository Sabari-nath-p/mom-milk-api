"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SleepLogsModule = void 0;
const common_1 = require("@nestjs/common");
const sleep_logs_service_1 = require("./sleep-logs.service");
const sleep_logs_controller_1 = require("./sleep-logs.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let SleepLogsModule = class SleepLogsModule {
};
exports.SleepLogsModule = SleepLogsModule;
exports.SleepLogsModule = SleepLogsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [sleep_logs_controller_1.SleepLogsController],
        providers: [sleep_logs_service_1.SleepLogsService],
        exports: [sleep_logs_service_1.SleepLogsService],
    })
], SleepLogsModule);
//# sourceMappingURL=sleep-logs.module.js.map