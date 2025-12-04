/**
 * Get messages handler
 * GET /chat/conversations/{conversationId}/messages
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getMessages } from '../services/chatService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const conversationId = event.pathParameters?.conversationId

    if (!conversationId) {
      return badRequest('conversationId is required')
    }

    const messages = await getMessages(conversationId, auth.userId)
    return success(messages)
  } catch (err: any) {
    console.error('Error fetching messages:', err)
    return error('Failed to fetch messages', 500)
  }
}

