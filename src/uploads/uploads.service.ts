import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import type { Client } from 'minio';
import { MINIO_CLIENT } from './minio.constants';

export interface UploadedImageResult {
    bucket: string;
    objectName: string;
    etag?: string;
    size: number;
    mimeType: string;
    originalName: string;
    url: string;
}

@Injectable()
export class UploadsService {
    private ensuredBuckets = new Set<string>();

    constructor(
        @Inject(MINIO_CLIENT) private readonly minioClient: Client,
        private readonly configService: ConfigService,
    ) { }

    private getBucketName(): string {
        return this.configService.get<string>('MINIO_BUCKET', 'uploads');
    }

    private getPublicBaseUrl(): string | undefined {
        const value = this.configService.get<string>('MINIO_PUBLIC_URL');
        return value ? value.replace(/\/$/, '') : undefined;
    }

    private getPresignExpirySeconds(): number {
        const raw = this.configService.get<string>('MINIO_PRESIGN_EXPIRES_SECONDS', '86400');
        const expiry = Number.parseInt(raw, 10);
        return Number.isFinite(expiry) && expiry > 0 ? expiry : 86400;
    }

    private async ensureBucket(bucket: string): Promise<void> {
        if (this.ensuredBuckets.has(bucket)) return;

        const exists = await this.minioClient.bucketExists(bucket);

        if (!exists) {
            await this.minioClient.makeBucket(bucket, '');
        }

        this.ensuredBuckets.add(bucket);
    }

    private buildObjectName(originalName: string): string {
        const extension = extname(originalName || '').toLowerCase();
        const safeExtension = extension && extension.length <= 10 ? extension : '';
        return `images/${randomUUID()}${safeExtension}`;
    }

    private async putObject(params: {
        bucket: string;
        objectName: string;
        buffer: Buffer;
        size: number;
        mimeType: string;
    }): Promise<{ etag?: string }> {
        const meta = {
            'Content-Type': params.mimeType,
        };

        const result: any = await this.minioClient.putObject(
            params.bucket,
            params.objectName,
            params.buffer,
            params.size,
            meta,
        );

        const etag = typeof result === 'string' ? result : result?.etag;
        return { etag: etag ?? undefined };
    }

    private async presignedGetUrl(bucket: string, objectName: string): Promise<string> {
        const expiry = this.getPresignExpirySeconds();

        return this.minioClient.presignedGetObject(bucket, objectName, expiry);
    }

    private buildPublicUrl(bucket: string, objectName: string): string | undefined {
        const baseUrl = this.getPublicBaseUrl();
        if (!baseUrl) return undefined;

        const encoded = objectName
            .split('/')
            .map((segment) => encodeURIComponent(segment))
            .join('/');

        return `${baseUrl}/${encodeURIComponent(bucket)}/${encoded}`;
    }

    async uploadImages(files: Express.Multer.File[]): Promise<UploadedImageResult[]> {
        const bucket = this.getBucketName();

        try {
            await this.ensureBucket(bucket);
        } catch (err) {
            throw new InternalServerErrorException(
                'Unable to connect to MinIO or ensure bucket exists. Check MINIO_* environment variables.',
            );
        }

        const results: UploadedImageResult[] = [];

        for (const file of files) {
            const objectName = this.buildObjectName(file.originalname);

            const { etag } = await this.putObject({
                bucket,
                objectName,
                buffer: file.buffer,
                size: file.size,
                mimeType: file.mimetype,
            });

            const publicUrl = this.buildPublicUrl(bucket, objectName);
            const url = publicUrl ?? (await this.presignedGetUrl(bucket, objectName));

            results.push({
                bucket,
                objectName,
                etag,
                size: file.size,
                mimeType: file.mimetype,
                originalName: file.originalname,
                url,
            });
        }

        return results;
    }
}
