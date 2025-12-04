/**
 * Log stress handler
 * POST /lifestyle/stress
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { logStress } from '../services/lifestyleService'
import { z } from 'zod'

const logStressSchema = z.object({
  level: z.number().int().min(1).max(10),
  notes: z.string().optional(),
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
    const validated = logStressSchema.parse(body)

    const result = await logStress(auth.userId, validated)
    return success(result)
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    console.error('Error logging stress:', err)
    return error('Failed to log stress', 500)
  }
}

