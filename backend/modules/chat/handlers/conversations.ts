/**
 * Get conversations handler
 * GET /chat/conversations
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getConversations } from '../services/chatService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const conversations = await getConversations(auth.userId)
    return success(conversations)
  } catch (err: any) {
    console.error('Error fetching conversations:', err)
    return error('Failed to fetch conversations', 500)
  }
}

