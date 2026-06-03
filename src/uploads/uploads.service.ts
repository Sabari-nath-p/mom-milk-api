import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { extname } from "path";
import type { Client } from "minio";
import { MINIO_CLIENT } from "./minio.constants";

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
  ) {}

  private getBucketName(): string {
    return this.configService.get<string>("MINIO_BUCKET", "image");
  }

  private getPublicBaseUrl(): string | undefined {
    const value = this.configService.get<string>("MINIO_PUBLIC_URL");
    return value ? value.replace(/\/$/, "") : undefined;
  }

  private buildPublicReadPolicy(bucket: string): string {
    return JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicRead",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    });
  }

  private async ensureBucket(bucket: string): Promise<void> {
    if (this.ensuredBuckets.has(bucket)) return;

    const exists = await this.minioClient.bucketExists(bucket);

    if (!exists) {
      await this.minioClient.makeBucket(bucket, "");
    }

    // Ensure objects are readable via plain URL (no signature)
    await this.minioClient.setBucketPolicy(
      bucket,
      this.buildPublicReadPolicy(bucket),
    );

    this.ensuredBuckets.add(bucket);
  }

  private buildObjectName(originalName: string): string {
    const extension = extname(originalName || "").toLowerCase();
    const safeExtension = extension && extension.length <= 10 ? extension : "";
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
      "Content-Type": params.mimeType,
    };

    const result: any = await this.minioClient.putObject(
      params.bucket,
      params.objectName,
      params.buffer,
      params.size,
      meta,
    );

    const etag = typeof result === "string" ? result : result?.etag;
    return { etag: etag ?? undefined };
  }

  private buildPublicUrl(
    bucket: string,
    objectName: string,
  ): string | undefined {
    const baseUrl = this.getPublicBaseUrl();
    if (!baseUrl) return undefined;

    const encoded = objectName
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return `${baseUrl}/${encodeURIComponent(bucket)}/${encoded}`;
  }

  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<UploadedImageResult[]> {
    const bucket = this.getBucketName();

    try {
      await this.ensureBucket(bucket);
    } catch (err) {
      throw new InternalServerErrorException(
        "Unable to connect to MinIO or ensure bucket exists. Check MINIO_* environment variables.",
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

      const url = this.buildPublicUrl(bucket, objectName);
      if (!url) {
        throw new InternalServerErrorException(
          "MINIO_PUBLIC_URL is required to return a permanent public image URL (non-signed).",
        );
      }

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
