/**
 * Mark all notifications as read handler
 * POST /notifications/read-all
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { markAllNotificationsRead } from '../services/notificationService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    await markAllNotificationsRead(auth.userId)
    return success({})
  } catch (err: any) {
    console.error('Error marking all notifications as read:', err)
    return error('Failed to mark all notifications as read', 500)
  }
}

