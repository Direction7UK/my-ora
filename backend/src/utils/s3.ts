/**
 * S3 client for file uploads
 * Handles meal image uploads and presigned URLs
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.REGION || 'us-east-1',
})

const BUCKET = process.env.S3_BUCKET || ''

export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await s3Client.send(command)
  return key
}

export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export function getFileUrl(key: string): string {
  return `https://${BUCKET}.s3.${process.env.REGION || 'us-east-1'}.amazonaws.com/${key}`
}

