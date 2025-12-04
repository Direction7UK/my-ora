/**
 * Prediction service
 * Calculates health risk scores based on user data
 */

import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface PredictionData {
  riskScore: number
  factors: string[]
  recommendations: string[]
}

export async function calculatePrediction(userId: string): Promise<PredictionData & { predictionId: string }> {
  // Gather user data (lifestyle logs, symptoms, etc.)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get recent symptoms
  const symptomsResult = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.SYMPTOMS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
      Limit: 10,
    })
  )

  // Get lifestyle data
  const lifestyleResult = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESTYLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'createdAt >= :date',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':date': thirtyDaysAgo.toISOString(),
      },
    })
  )

  // Get LifeScore
  const lifescoreResult = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESCORE,
      KeyConditionExpression: 'userId = :userId',
      ScanIndexForward: false,
      Limit: 1,
    })
  )

  const symptoms = (symptomsResult.Items || []).slice(0, 5)
  const lifestyleLogs = lifestyleResult.Items || []
  const currentLifeScore = lifescoreResult.Items?.[0]

  // Build data summary for AI
  const meals = lifestyleLogs.filter((l) => l.type === 'meal').length
  const activities = lifestyleLogs.filter((l) => l.type === 'activity')
  const sleepLogs = lifestyleLogs.filter((l) => l.type === 'sleep')
  const stressLogs = lifestyleLogs.filter((l) => l.type === 'stress')

  const avgSleepHours = sleepLogs.length > 0
    ? sleepLogs.reduce((sum, s) => sum + (s.hours || 0), 0) / sleepLogs.length
    : null

  const avgStressLevel = stressLogs.length > 0
    ? stressLogs.reduce((sum, s) => sum + (s.level || 5), 0) / stressLogs.length
    : null

  const recentSymptoms = symptoms.map((s) => s.symptoms).flat()
  const highUrgencySymptoms = symptoms.filter((s) => s.urgency === 'high').length

  const dataSummary = `
User Health Data Summary (Last 30 days):
- Meals logged: ${meals}
- Activities logged: ${activities.length}
- Average sleep: ${avgSleepHours ? avgSleepHours.toFixed(1) + ' hours' : 'Not logged'}
- Average stress level: ${avgStressLevel ? avgStressLevel.toFixed(1) + '/10' : 'Not logged'}
- Recent symptoms: ${recentSymptoms.length > 0 ? recentSymptoms.join(', ') : 'None'}
- High urgency symptoms: ${highUrgencySymptoms}
- Current LifeScore: ${currentLifeScore ? currentLifeScore.overall + '/100' : 'Not calculated'}
`

  const prompt = `Based on the following user health data, calculate a health risk score (0-100, where 0 is lowest risk and 100 is highest risk) and provide:
${dataSummary}

Calculate the risk score considering:
1. Lifestyle factors (activity, nutrition, sleep, stress)
2. Symptom patterns and urgency
3. Overall health trends

Provide:
1. A list of 3-5 key risk factors
2. A list of 3-5 actionable recommendations

Return the response in JSON format with keys: riskScore (number), factors (array of strings), recommendations (array of strings).`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a health risk assessment AI. Provide accurate, helpful risk assessments.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
    max_tokens: 500,
  })

  const response = completion.choices[0]?.message?.content || '{}'
  let prediction: PredictionData

  try {
    prediction = JSON.parse(response)
  } catch {
    // Fallback if JSON parsing fails
    prediction = {
      riskScore: 50,
      factors: ['Insufficient data'],
      recommendations: ['Continue logging health data for better predictions'],
    }
  }

  const predictionId = uuidv4()

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.PREDICTIONS,
      Item: {
        predictionId,
        userId,
        riskScore: prediction.riskScore,
        factors: prediction.factors,
        recommendations: prediction.recommendations,
        createdAt: new Date().toISOString(),
      },
    })
  )

  return {
    predictionId,
    ...prediction,
  }
}

export async function getCurrentPrediction(userId: string) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.PREDICTIONS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
      Limit: 1,
    })
  )

  if (result.Items && result.Items.length > 0) {
    const item = result.Items[0]
    return {
      riskScore: item.riskScore,
      factors: item.factors,
      recommendations: item.recommendations,
      updatedAt: item.createdAt,
    }
  }

  // If no prediction exists, calculate one
  const prediction = await calculatePrediction(userId)
  return {
    riskScore: prediction.riskScore,
    factors: prediction.factors,
    recommendations: prediction.recommendations,
    updatedAt: new Date().toISOString(),
  }
}

export async function getPredictionHistory(userId: string) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.PREDICTIONS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
      Limit: 50,
    })
  )

  return (result.Items || []).map((item) => ({
    id: item.predictionId,
    riskScore: item.riskScore,
    createdAt: item.createdAt,
    factors: item.factors,
  }))
}

