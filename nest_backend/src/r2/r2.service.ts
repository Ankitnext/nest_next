import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class R2Service {
  private s3Client: S3Client;
  private bucketName = process.env.R2_BUCKET_NAME || 'vendor-products';
  private publicUrl = process.env.R2_PUBLIC_URL || '';

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadImage(file: any): Promise<{ url: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file provided');
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const key = `vendor_products/${filename}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      // Cloudflare R2 bucket can be attached to a custom domain (public access url)
      let fileUrl = `${this.publicUrl}/${key}`;
      
      // Fallback if publicUrl is not set
      if (!this.publicUrl) {
        fileUrl = `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`;
      }

      return { url: fileUrl };
    } catch (error: any) {
      throw new BadRequestException(`Failed to upload to R2: ${error.message}`);
    }
  }
}
