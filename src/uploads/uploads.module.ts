import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { minioClientProvider } from './minio.provider';

@Module({
    controllers: [UploadsController],
    providers: [UploadsService, minioClientProvider],
})
export class UploadsModule { }
