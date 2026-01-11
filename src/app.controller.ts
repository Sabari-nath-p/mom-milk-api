import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Get()
    @ApiOperation({ summary: 'Get application info' })
    @ApiResponse({ status: 200, description: 'Returns application information' })
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('health')
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Application is healthy' })
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'moms-milk-api',
        };
    }

    @Get('getAppConfig')
    @ApiOperation({ summary: 'Get app configuration including minimum and current build numbers' })
    @ApiResponse({
        status: 200,
        description: 'Returns app configuration with build version information',
        schema: {
            type: 'object',
            properties: {
                minum_build_no_android: { type: 'number', example: 1 },
                minum_build_no_ver_ios: { type: 'number', example: 1 },
                current_build_no_android: { type: 'number', example: 2 },
                current_build_no_ios: { type: 'number', example: 3 },
            },
        },
    })
    getAppConfig() {
        return {
            minum_build_no_android: 1,
            minum_build_no_ver_ios: 1,
            current_build_no_android: 1,
            current_build_no_ios: 1,
        };
    }
}
