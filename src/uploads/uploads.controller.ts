import {
    BadRequestException,
    Controller,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post('images')
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
            required: ['files'],
        },
    })
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: memoryStorage(),
            limits: {
                files: 10,
                fileSize: 10 * 1024 * 1024,
            },
        }),
    )
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        if (!files?.length) {
            throw new BadRequestException('No files uploaded. Use multipart/form-data with field name "files".');
        }

        const nonImages = files.filter((f) => !f.mimetype?.startsWith('image/'));
        if (nonImages.length > 0) {
            throw new BadRequestException('Only image/* files are allowed.');
        }

        return this.uploadsService.uploadImages(files);
    }
}
