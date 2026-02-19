import fp from 'fastify-plugin';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FastifyInstance } from 'fastify';
import { config } from '../config';

const s3Client = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKey || '',
    secretAccessKey: config.s3.secretKey || '',
  },
  forcePathStyle: true,
});

interface StorageService {
  getUploadUrl(key: string): Promise<string>;
  getDownloadUrl(key: string): Promise<string>;
}

declare module 'fastify' {
  interface FastifyInstance {
    storage: StorageService;
  }
}

const s3Plugin = fp(async (fastify) => {
  const service: StorageService = {
    async getUploadUrl(key: string) {
      const command = new PutObjectCommand({ Bucket: config.s3.bucket, Key: key });
      return getSignedUrl(s3Client, command, { expiresIn: 3600 });
    },
    async getDownloadUrl(key: string) {
      const command = new GetObjectCommand({ Bucket: config.s3.bucket, Key: key });
      return getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }
  };

  fastify.decorate('storage', service);
});

export default s3Plugin;