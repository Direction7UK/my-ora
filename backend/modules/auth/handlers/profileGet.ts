/**
 * Get profile handler
 * GET /profile
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)

    const result = await dynamoClient.send(
      new GetCommand({
        TableName: TABLES.USERS,
        Key: {
          userId: auth.userId,
        },
      })
    )

    if (!result.Item) {
      // Create user if doesn't exist
      const newUser = {
        userId: auth.userId,
        email: auth.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await dynamoClient.send(
        new PutCommand({
          TableName: TABLES.USERS,
          Item: newUser,
        })
      )

      return success({
        id: newUser.userId,
        email: newUser.email,
        preferences: {},
      })
    }

    return success({
      id: result.Item.userId,
      email: result.Item.email,
      name: result.Item.name,
      preferences: result.Item.preferences || {},
    })
  } catch (err: any) {
    console.error('Error fetching profile:', err)
    return error('Failed to fetch profile', 500)
  }
}

