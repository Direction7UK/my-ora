/**
 * Get notifications handler
 * GET /notifications
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getNotifications } from '../services/notificationService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const notifications = await getNotifications(auth.userId)
    return success(notifications)
  } catch (err: any) {
    console.error('Error fetching notifications:', err)
    return error('Failed to fetch notifications', 500)
  }
}

