import { Client } from 'minio';
import mime from 'mime-types';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'minio:9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';

// Initialize MinIO client
export const getMinioClient = () => {
  return new Client({
    endPoint: process.env.MINIO_ENDPOINT?.split(':')[0] || 'minio',
    port: parseInt(MINIO_ENDPOINT.split(':')[1]) || 9000,
    useSSL: false,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
  });
};

// Set bucket policy
const setBucketPolicy = async (minioClient, bucketName) => {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  };

  const policyJson = JSON.stringify(policy);
  await minioClient.setBucketPolicy(bucketName, policyJson);
};

// Create bucket if it doesn't exist
export const createBucket = async (minioClient, bucketName) => {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName);
    await setBucketPolicy(minioClient, bucketName);
  }
};

export const uploadMedia = async (fileContent, filename:string|null, bucketName = 'media') => {
  try {
    if (!fileContent) {
      throw new Error('File content is required.');
    }

    const minioClient = getMinioClient();

    // Ensure the bucket exists
    await createBucket(minioClient, bucketName);

    // Generate a filename if none is provided
    if (!filename) {
      filename = `${uuidv4()}.jpg`; // Default to .jpg
    }

    // Detect content type
    const contentType = mime.lookup(filename) || 'application/octet-stream';

    // Convert fileContent to a readable stream
    const fileStream = new Readable();
    fileStream._read = () => {};
    fileStream.push(fileContent);
    fileStream.push(null);

    // Upload file to MinIO
    await minioClient.putObject(bucketName, filename, fileStream, fileContent.length, {
      'Content-Type': contentType,
    });

    // Generate and return the public URL
    return `http://${MINIO_ENDPOINT}/${bucketName}/${filename}`;
  } catch (error) {
    console.error('Error uploading to MinIO:', error.message || error);
    return null;
  }
};