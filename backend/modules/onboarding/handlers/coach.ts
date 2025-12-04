/**
 * Coach personalization handler
 * POST /onboarding/coach
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { saveCoachSettings } from '../services/onboardingService'
import { requireAuth } from '../../../src/utils/auth'
import { z } from 'zod'

const coachSchema = z.object({
  coachName: z.string().min(1, 'Coach name is required'),
  avatar: z.string().optional(),
  userId: z.string(),
})

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const authContext = await requireAuth(event)
    
    if (!event.body) {
      return badRequest('Request body is required')
    }

    const body = JSON.parse(event.body)
    const validated = coachSchema.parse({
      ...body,
      userId: authContext.userId,
    })

    // Save coach settings
    await saveCoachSettings(validated.userId, {
      coachName: validated.coachName,
      avatar: validated.avatar || '1',
    })

    return success({ saved: true })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    
    console.error('Error saving coach settings:', err)
    return error('Failed to save coach settings', 500)
  }
}

