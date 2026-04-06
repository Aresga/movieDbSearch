import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

type R2Context = {
  client: S3Client;
  bucket: string;
  publicBase: string;
};

@Injectable()
export class R2AvatarService {
  constructor(private readonly config: ConfigService) {}

  private getR2Context(): R2Context {
    const accountId = this.config.get<string>('R2_ACCOUNT_ID');
    const accessKey = this.config.get<string>('R2_ACCESS_KEY');
    const secretKey = this.config.get<string>('R2_SECRET_KEY');
    const bucket = this.config.get<string>('R2_BUCKET_NAME');
    let publicBase = this.config.get<string>('R2_PUBLIC_DOMAIN')?.trim();

    if (!accountId || !accessKey || !secretKey || !bucket || !publicBase) {
      throw new ServiceUnavailableException('Avatar upload is not configured');
    }

    if (!publicBase.startsWith('http://') && !publicBase.startsWith('https://')) {
      publicBase = `https://${publicBase}`;
    }
    publicBase = publicBase.replace(/\/$/, '');

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });

    return { client, bucket, publicBase };
  }

  private buildKey(userId: string, contentType: string) {
    const ext = EXT_BY_TYPE[contentType];
    if (!ext) throw new BadRequestException('Unsupported image type');
    return `avatars/${userId}/${randomUUID()}.${ext}`;
  }

  async putAvatarObject(userId: string, body: Buffer, contentType: string) {
    const { client, bucket, publicBase } = this.getR2Context();
    const key = this.buildKey(userId, contentType);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return { publicUrl: `${publicBase}/${key}` };
  }
}
