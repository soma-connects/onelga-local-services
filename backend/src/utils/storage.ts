import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

// Initialize S3 client with proper configuration
const getS3Config = () => {
  const region = process.env['AWS_REGION'];
  const accessKeyId = process.env['AWS_ACCESS_KEY_ID'];
  const secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
  
  const config: any = {};
  
  if (region) {
    config.region = region;
  }
  
  if (accessKeyId && secretAccessKey) {
    config.credentials = {
      accessKeyId,
      secretAccessKey
    };
  }
  
  return config;
};

const s3 = new S3Client(getS3Config());

export type StoredFile = { 
  key: string; 
  url: string; 
};

export const storage = {
  async uploadLocal(tempPath: string, fileName: string): Promise<StoredFile> {
    const uploadDir = process.env['UPLOAD_DIR'] || 'uploads';
    const dest = path.resolve(process.cwd(), uploadDir, fileName);
    
    // Ensure upload directory exists
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    
    await fs.promises.copyFile(tempPath, dest);
    logger.info(`File uploaded locally: ${fileName}`);
    
    return { 
      key: dest, 
      url: `/uploads/${path.basename(dest)}` 
    };
  },

  async deleteLocal(destPath: string): Promise<void> {
    try { 
      await fs.promises.unlink(destPath); 
      logger.info(`File deleted locally: ${destPath}`);
    } catch (error) {
      logger.warn(`Failed to delete local file: ${destPath}`, error);
    }
  },

  async uploadS3(tempPath: string, fileName: string): Promise<StoredFile> {
    const bucket = process.env['AWS_S3_BUCKET']!;
    const key = `uploads/${Date.now()}-${fileName}`;
    const body = await fs.promises.readFile(tempPath);
    
    await s3.send(new PutObjectCommand({ 
      Bucket: bucket, 
      Key: key, 
      Body: body,
      ContentType: this.getMimeType(fileName)
    }));
    
    const base = process.env['AWS_S3_PUBLIC_URL'] || `https://${bucket}.s3.amazonaws.com`;
    logger.info(`File uploaded to S3: ${key}`);
    
    return { 
      key, 
      url: `${base}/${key}` 
    };
  },

  async deleteS3(key: string): Promise<void> {
    const bucket = process.env['AWS_S3_BUCKET']!;
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      logger.info(`File deleted from S3: ${key}`);
    } catch (error) {
      logger.warn(`Failed to delete S3 file: ${key}`, error);
    }
  },

  async upload(tempPath: string, fileName: string): Promise<StoredFile> {
    if (process.env['STORAGE_DRIVER'] === 's3') {
      if (!process.env['AWS_S3_BUCKET']) {
        throw new Error('AWS_S3_BUCKET environment variable is required for S3 storage');
      }
      return this.uploadS3(tempPath, fileName);
    }
    return this.uploadLocal(tempPath, fileName);
  },

  async remove(keyOrPath: string): Promise<void> {
    if (process.env['STORAGE_DRIVER'] === 's3') {
      return this.deleteS3(keyOrPath);
    }
    return this.deleteLocal(keyOrPath);
  },

  getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.csv': 'text/csv'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
};

export default storage;