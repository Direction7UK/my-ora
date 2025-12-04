/**
 * Log activity handler
 * POST /lifestyle/activities
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { logActivity } from '../services/lifestyleService'
import { z } from 'zod'

const logActivitySchema = z.object({
  type: z.string().min(1),
  duration: z.number().positive(),
  intensity: z.enum(['low', 'medium', 'high']),
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
    const validated = logActivitySchema.parse(body)

    const result = await logActivity(auth.userId, validated)
    return success(result)
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    console.error('Error logging activity:', err)
    return error('Failed to log activity', 500)
  }
}

