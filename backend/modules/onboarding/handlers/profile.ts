/**
 * Profile completion handler
 * POST /onboarding/profile
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { completeProfile } from '../services/onboardingService'
import { requireAuth } from '../../../src/utils/auth'
import { z } from 'zod'

const profileSchema = z.object({
  age: z.string().optional(),
  gender: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  healthGoals: z.string().optional(),
  medicalConditions: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
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
    const validated = profileSchema.parse({
      ...body,
      userId: authContext.userId,
    })

    // Hash password if provided
    let passwordHash: string | undefined
    if (validated.password) {
      const bcrypt = await import('bcryptjs')
      passwordHash = await bcrypt.hash(validated.password, 10)
    }

    // Complete user profile
    await completeProfile(validated.userId, {
      age: validated.age ? parseInt(validated.age) : undefined,
      gender: validated.gender,
      height: validated.height ? parseFloat(validated.height) : undefined,
      weight: validated.weight ? parseFloat(validated.weight) : undefined,
      healthGoals: validated.healthGoals,
      medicalConditions: validated.medicalConditions,
      passwordHash,
      onboardingCompleted: true,
    })

    return success({ completed: true })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    
    console.error('Error completing profile:', err)
    return error('Failed to complete profile', 500)
  }
}

