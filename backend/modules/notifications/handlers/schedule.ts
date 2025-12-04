/**
 * Scheduled notifications handler
 * Runs hourly via EventBridge to send reminders
 */

import { EventBridgeEvent } from 'aws-lambda'
import { createNotification } from '../services/notificationService'
import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'

export const handler = async (event: EventBridgeEvent<string, any>) => {
  try {
    // Get all users
    const result = await dynamoClient.send(
      new ScanCommand({
        TableName: TABLES.USERS,
        ProjectionExpression: 'userId',
      })
    )

    const userIds = (result.Items || []).map((item) => item.userId)

    // Create reminder notifications
    await Promise.all(
      userIds.map((userId) =>
        createNotification(
          userId,
          'reminder',
          'Daily Health Check',
          'Remember to log your meals, activities, and sleep today!'
        )
      )
    )

    console.log(`Created notifications for ${userIds.length} users`)
  } catch (error) {
    console.error('Error scheduling notifications:', error)
    throw error
  }
}

