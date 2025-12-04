/**
 * LifeScore service
 * Calculates Move, Fuel, and Recharge scores based on lifestyle data
 */

import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { format } from 'date-fns'

export interface LifeScoreData {
  move: number
  fuel: number
  recharge: number
  overall: number
  factors: {
    move: string[]
    fuel: string[]
    recharge: string[]
  }
}

export async function calculateLifeScore(userId: string): Promise<LifeScoreData> {
  // Get lifestyle logs from the past 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Get activities (Move score)
  const activitiesResult = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESTYLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#type = :type AND createdAt >= :date',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':type': 'activity',
        ':date': sevenDaysAgo.toISOString(),
      },
    })
  )

  // Get meals (Fuel score)
  const mealsResult = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESTYLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#type = :type AND createdAt >= :date',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':type': 'meal',
        ':date': sevenDaysAgo.toISOString(),
      },
    })
  )

  // Get sleep logs (Recharge score)
  const sleepResult = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESTYLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#type = :type AND createdAt >= :date',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':type': 'sleep',
        ':date': sevenDaysAgo.toISOString(),
      },
    })
  )

  // Get stress logs (Recharge score)
  const stressResult = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESTYLE,
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#type = :type AND createdAt >= :date',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':type': 'stress',
        ':date': sevenDaysAgo.toISOString(),
      },
    })
  )

  const activities = activitiesResult.Items || []
  const meals = mealsResult.Items || []
  const sleepLogs = sleepResult.Items || []
  const stressLogs = stressResult.Items || []

  // Calculate Move score (0-100) based on activity frequency and intensity
  let move = 50 // Base score
  const activityMinutes = activities.reduce((sum, a) => sum + (a.duration || 0), 0)
  const avgActivityPerDay = activityMinutes / 7
  
  if (avgActivityPerDay >= 30) move = 90
  else if (avgActivityPerDay >= 20) move = 80
  else if (avgActivityPerDay >= 10) move = 70
  else if (avgActivityPerDay >= 5) move = 60
  else if (avgActivityPerDay > 0) move = 50
  else move = 30

  // Adjust for intensity
  const highIntensityCount = activities.filter((a) => a.intensity === 'high').length
  if (highIntensityCount > 0) move = Math.min(100, move + 10)

  // Calculate Fuel score (0-100) based on meal frequency and nutrition
  let fuel = 50 // Base score
  const mealsPerDay = meals.length / 7
  if (mealsPerDay >= 3) fuel = 85
  else if (mealsPerDay >= 2) fuel = 70
  else if (mealsPerDay >= 1) fuel = 60
  else fuel = 40

  // Check for balanced nutrition in meals
  const hasNutritionData = meals.some((m) => m.nutrition && Object.keys(m.nutrition).length > 0)
  if (hasNutritionData) fuel = Math.min(100, fuel + 10)

  // Calculate Recharge score (0-100) based on sleep and stress
  let recharge = 50 // Base score
  
  if (sleepLogs.length > 0) {
    const avgSleepHours = sleepLogs.reduce((sum, s) => sum + (s.hours || 0), 0) / sleepLogs.length
    if (avgSleepHours >= 7 && avgSleepHours <= 9) recharge = 90
    else if (avgSleepHours >= 6 && avgSleepHours <= 10) recharge = 75
    else if (avgSleepHours >= 5) recharge = 60
    else recharge = 40

    // Adjust for sleep quality
    const goodQualityCount = sleepLogs.filter((s) => s.quality === 'good' || s.quality === 'excellent').length
    if (goodQualityCount > sleepLogs.length / 2) recharge = Math.min(100, recharge + 10)
  }

  // Adjust for stress levels
  if (stressLogs.length > 0) {
    const avgStress = stressLogs.reduce((sum, s) => sum + (s.level || 5), 0) / stressLogs.length
    if (avgStress <= 3) recharge = Math.min(100, recharge + 10)
    else if (avgStress >= 7) recharge = Math.max(0, recharge - 20)
  }

  const overall = Math.round((move + fuel + recharge) / 3)

  const factors = {
    move: [] as string[],
    fuel: [] as string[],
    recharge: [] as string[],
  }

  if (avgActivityPerDay >= 30) factors.move.push('Excellent activity levels')
  else if (avgActivityPerDay >= 20) factors.move.push('Good activity levels')
  else if (avgActivityPerDay < 10) factors.move.push('Low activity - aim for 30+ min/day')
  
  if (mealsPerDay >= 3) factors.fuel.push('Regular meal logging')
  else factors.fuel.push('Log more meals for better tracking')
  
  if (sleepLogs.length > 0) {
    const avgSleep = sleepLogs.reduce((sum, s) => sum + (s.hours || 0), 0) / sleepLogs.length
    if (avgSleep >= 7 && avgSleep <= 9) factors.recharge.push('Optimal sleep duration')
    else factors.recharge.push(`Average sleep: ${avgSleep.toFixed(1)} hours`)
  } else {
    factors.recharge.push('Log sleep for better tracking')
  }
  
  if (stressLogs.length > 0) {
    const avgStress = stressLogs.reduce((sum, s) => sum + (s.level || 5), 0) / stressLogs.length
    if (avgStress <= 3) factors.recharge.push('Low stress levels')
    else if (avgStress >= 7) factors.recharge.push('High stress - consider stress management')
  }

  const date = format(new Date(), 'yyyy-MM-dd')

  // Save to DynamoDB
  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.LIFESCORE,
      Item: {
        userId,
        date,
        move,
        fuel,
        recharge,
        overall,
        factors,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
  )

  return {
    move,
    fuel,
    recharge,
    overall,
    factors,
  }
}

export async function getCurrentLifeScore(userId: string) {
  const date = format(new Date(), 'yyyy-MM-dd')
  
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESCORE,
      KeyConditionExpression: 'userId = :userId AND #date = :date',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':date': date,
      },
    })
  )

  if (result.Items && result.Items.length > 0) {
    const item = result.Items[0]
    return {
      move: item.move,
      fuel: item.fuel,
      recharge: item.recharge,
      overall: item.overall,
      updatedAt: item.updatedAt,
    }
  }

  // If no score exists, calculate one
  const score = await calculateLifeScore(userId)
  return {
    move: score.move,
    fuel: score.fuel,
    recharge: score.recharge,
    overall: score.overall,
    updatedAt: new Date().toISOString(),
  }
}

export async function getLifeScoreHistory(userId: string, days: number = 30) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.LIFESCORE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
      Limit: days,
    })
  )

  return (result.Items || []).map((item) => ({
    date: item.date,
    move: item.move,
    fuel: item.fuel,
    recharge: item.recharge,
    overall: item.overall,
  }))
}

