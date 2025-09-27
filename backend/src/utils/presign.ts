import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from './logger';

// Helper function to get S3 client configuration
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

export async function getPresignedGetUrl(key: string, expiresInSeconds = 300): Promise<string> {
  try {
    const s3 = new S3Client(getS3Config());
    
    const bucket = process.env['AWS_S3_BUCKET']!;
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET environment variable is required');
    }
    
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
    
    logger.info(`Generated presigned URL for ${key}, expires in ${expiresInSeconds} seconds`);
    return url;
  } catch (error) {
    logger.error(`Failed to generate presigned URL for ${key}:`, error);
    throw error;
  }
}

export async function getPresignedPutUrl(key: string, expiresInSeconds = 300): Promise<string> {
  try {
    const s3 = new S3Client(getS3Config());
    
    const bucket = process.env['AWS_S3_BUCKET']!;
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET environment variable is required');
    }
    
    const cmd = new PutObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds });
    
    logger.info(`Generated presigned PUT URL for ${key}, expires in ${expiresInSeconds} seconds`);
    return url;
  } catch (error) {
    logger.error(`Failed to generate presigned PUT URL for ${key}:`, error);
    throw error;
  }
}