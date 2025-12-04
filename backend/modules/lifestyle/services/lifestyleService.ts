/**
 * Lifestyle logging service
 * Handles meal, activity, sleep, and stress logs
 */

import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { uploadFile, getFileUrl } from '../../../src/utils/s3'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function logMeal(
  userId: string,
  imageBuffer: Buffer,
  contentType: string,
  notes?: string
) {
  // Upload image to S3
  const s3Key = `meals/${userId}/${uuidv4()}.jpg`
  await uploadFile(s3Key, imageBuffer, contentType)
  const imageUrl = getFileUrl(s3Key)

  // Analyze meal with OpenAI Vision
  const base64Image = imageBuffer.toString('base64')
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this meal image and provide nutritional information in JSON format: calories, protein (g), carbs (g), fats (g), and any notable vitamins or nutrients. Return only valid JSON.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${contentType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  })

  const nutritionText = response.choices[0]?.message?.content || '{}'
  let nutrition
  try {
    nutrition = JSON.parse(nutritionText)
  } catch {
    nutrition = {}
  }

  const logId = uuidv4()

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.LIFESTYLE,
      Item: {
        logId,
        userId,
        type: 'meal',
        imageUrl,
        s3Key,
        nutrition,
        notes,
        createdAt: new Date().toISOString(),
      },
    })
  )

  return {
    id: logId,
    nutrition,
    createdAt: new Date().toISOString(),
  }
}

export async function logActivity(
  userId: string,
  data: { type: string; duration: number; intensity: string }
) {
  const logId = uuidv4()

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.LIFESTYLE,
      Item: {
        logId,
        userId,
        type: 'activity',
        activityType: data.type,
        duration: data.duration,
        intensity: data.intensity,
        createdAt: new Date().toISOString(),
      },
    })
  )

  return {
    id: logId,
    createdAt: new Date().toISOString(),
  }
}

export async function logSleep(userId: string, data: { hours: number; quality: string }) {
  const logId = uuidv4()

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.LIFESTYLE,
      Item: {
        logId,
        userId,
        type: 'sleep',
        hours: data.hours,
        quality: data.quality,
        createdAt: new Date().toISOString(),
      },
    })
  )

  return {
    id: logId,
    createdAt: new Date().toISOString(),
  }
}

export async function logStress(userId: string, data: { level: number; notes?: string }) {
  const logId = uuidv4()

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.LIFESTYLE,
      Item: {
        logId,
        userId,
        type: 'stress',
        level: data.level,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      },
    })
  )

  return {
    id: logId,
    createdAt: new Date().toISOString(),
  }
}

export async function getLogs(userId: string, logType: string, days: number = 30) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESTYLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#type = :type',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':type': logType,
      },
      ScanIndexForward: false,
    })
  )

  // Filter by date range
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return (result.Items || [])
    .filter((item) => new Date(item.createdAt) >= cutoffDate)
    .map((item) => ({
      id: item.logId,
      ...item,
    }))
}

