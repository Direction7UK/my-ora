/**
 * Scheduled LifeScore calculation handler
 * Runs hourly via EventBridge to recalculate scores
 */

import { EventBridgeEvent } from 'aws-lambda'
import { calculateLifeScore } from '../services/lifescoreService'
import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

export const handler = async (event: EventBridgeEvent<string, any>) => {
  try {
    // Get all users (in production, use pagination)
    const result = await dynamoClient.send(
      new ScanCommand({
        TableName: TABLES.USERS,
        ProjectionExpression: 'userId',
      })
    )

    const userIds = (result.Items || []).map((item) => item.userId)

    // Calculate LifeScore for each user
    await Promise.all(userIds.map((userId) => calculateLifeScore(userId)))

    console.log(`Calculated LifeScore for ${userIds.length} users`)
  } catch (error) {
    console.error('Error calculating LifeScore:', error)
    throw error
  }
}

