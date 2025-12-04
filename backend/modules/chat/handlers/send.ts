/**
 * Chat send message handler
 * POST /chat
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { sendMessage } from '../services/chatService'
import { z } from 'zod'

const sendMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
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
    const validated = sendMessageSchema.parse(body)

    const result = await sendMessage(
      auth.userId,
      validated.message,
      validated.conversationId
    )

    return success(result)
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    console.error('Error sending message:', err)
    return error('Failed to send message', 500)
  }
}

