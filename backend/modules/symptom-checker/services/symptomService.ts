/**
 * Symptom checker service
 * Analyzes symptoms using OpenAI and provides recommendations
 */

import { OpenAI } from 'openai'
import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface SymptomAnalysis {
  analysis: string
  recommendations: string[]
  urgency: 'low' | 'medium' | 'high'
}

export async function analyzeSymptoms(
  userId: string,
  symptoms: string[]
): Promise<SymptomAnalysis & { symptomId: string }> {
  const prompt = `Analyze the following symptoms and provide:
1. A brief analysis of what these symptoms might indicate
2. A list of 3-5 actionable recommendations
3. An urgency level (low, medium, or high)

Symptoms: ${symptoms.join(', ')}

Important: Always remind the user to consult a healthcare professional for serious concerns.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a medical assistant. Provide helpful but cautious guidance. Always emphasize consulting healthcare professionals.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  })

  const response = completion.choices[0]?.message?.content || ''
  
  // Parse response (simplified - in production, use structured output)
  const analysis = response
  const recommendations = extractRecommendations(response)
  const urgency = extractUrgency(response)

  const symptomId = uuidv4()

  // Save to DynamoDB
  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.SYMPTOMS,
      Item: {
        symptomId,
        userId,
        symptoms,
        analysis,
        recommendations,
        urgency,
        createdAt: new Date().toISOString(),
      },
    })
  )

  return {
    symptomId,
    analysis,
    recommendations,
    urgency,
  }
}

function extractRecommendations(response: string): string[] {
  // Simple extraction - in production, use structured output from OpenAI
  const lines = response.split('\n').filter((line) => line.trim())
  return lines
    .filter((line) => line.match(/^\d+\.|^-/))
    .map((line) => line.replace(/^\d+\.|^-/, '').trim())
    .slice(0, 5)
}

function extractUrgency(response: string): 'low' | 'medium' | 'high' {
  const lower = response.toLowerCase()
  if (lower.includes('high') || lower.includes('urgent') || lower.includes('emergency')) {
    return 'high'
  }
  if (lower.includes('medium') || lower.includes('moderate')) {
    return 'medium'
  }
  return 'low'
}

export async function getSymptomHistory(userId: string) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.SYMPTOMS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Most recent first
      Limit: 50,
    })
  )

  return (result.Items || []).map((item) => ({
    id: item.symptomId,
    symptoms: item.symptoms,
    createdAt: item.createdAt,
    urgency: item.urgency,
  }))
}

