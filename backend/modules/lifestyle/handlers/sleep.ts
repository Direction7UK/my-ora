/**
 * Log sleep handler
 * POST /lifestyle/sleep
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { logSleep } from '../services/lifestyleService'
import { z } from 'zod'

const logSleepSchema = z.object({
  hours: z.number().positive().max(24),
  quality: z.enum(['poor', 'fair', 'good', 'excellent']),
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
    const validated = logSleepSchema.parse(body)

    const result = await logSleep(auth.userId, validated)
    return success(result)
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    console.error('Error logging sleep:', err)
    return error('Failed to log sleep', 500)
  }
}

