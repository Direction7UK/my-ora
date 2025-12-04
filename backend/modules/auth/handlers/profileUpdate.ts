/**
 * Update profile handler
 * PUT /profile
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().optional(),
  preferences: z.record(z.any()).optional(),
})

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    
    if (!event.body) {
      return badRequest('Request body is required')
    }

    const body = JSON.parse(event.body)
    const validated = updateProfileSchema.parse(body)

    const updateExpression: string[] = []
    const expressionAttributeValues: Record<string, any> = {}
    const expressionAttributeNames: Record<string, string> = {}

    if (validated.name !== undefined) {
      updateExpression.push('#name = :name')
      expressionAttributeNames['#name'] = 'name'
      expressionAttributeValues[':name'] = validated.name
    }

    if (validated.preferences !== undefined) {
      updateExpression.push('preferences = :preferences')
      expressionAttributeValues[':preferences'] = validated.preferences
    }

    updateExpression.push('updatedAt = :updatedAt')
    expressionAttributeValues[':updatedAt'] = new Date().toISOString()

    await dynamoClient.send(
      new UpdateCommand({
        TableName: TABLES.USERS,
        Key: {
          userId: auth.userId,
        },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    )

    return success({ id: auth.userId })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    console.error('Error updating profile:', err)
    return error('Failed to update profile', 500)
  }
}

