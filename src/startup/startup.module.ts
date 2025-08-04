import { Module } from '@nestjs/common';
import { StartupService } from './startup.service';
import { RequestModule } from '../requests/requests.module';

@Module({
    imports: [RequestModule],
    providers: [StartupService],
    exports: [StartupService],
})
export class StartupModule { }
