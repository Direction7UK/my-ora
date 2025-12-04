/**
 * Mark notification as read handler
 * POST /notifications/{id}/read
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { markNotificationRead } from '../services/notificationService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const notificationId = event.pathParameters?.id

    if (!notificationId) {
      return badRequest('Notification ID is required')
    }

    await markNotificationRead(auth.userId, notificationId)
    return success({})
  } catch (err: any) {
    console.error('Error marking notification as read:', err)
    return error('Failed to mark notification as read', 500)
  }
}

