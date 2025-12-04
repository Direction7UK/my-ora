/**
 * Symptom check handler
 * POST /symptoms/check
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { analyzeSymptoms } from '../services/symptomService'
import { z } from 'zod'

const checkSymptomsSchema = z.object({
  symptoms: z.array(z.string()).min(1).max(20),
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
    const validated = checkSymptomsSchema.parse(body)

    const result = await analyzeSymptoms(auth.userId, validated.symptoms)
    
    return success({
      analysis: result.analysis,
      recommendations: result.recommendations,
      urgency: result.urgency,
    })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    console.error('Error checking symptoms:', err)
    return error('Failed to analyze symptoms', 500)
  }
}

