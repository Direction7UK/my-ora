/**
 * Verification code handler
 * POST /onboarding/verify-code
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { verifyCode } from '../services/verificationService'
import { requireAuth } from '../../../src/utils/auth'
import { z } from 'zod'

const verifyCodeSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  code: z.string().length(6, 'Code must be 6 digits'),
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
    const validated = verifyCodeSchema.parse({
      ...body,
      userId: authContext.userId,
    })

    if (!validated.phone && !validated.email) {
      return badRequest('Phone or email is required')
    }

    // Verify the code
    const verified = await verifyCode(
      validated.phone || validated.email!,
      validated.code,
      validated.userId,
      validated.phone ? 'phone' : 'email'
    )

    if (!verified) {
      return badRequest('Invalid or expired verification code')
    }

    return success({ verified: true })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    
    console.error('Error verifying code:', err)
    return error('Failed to verify code', 500)
  }
}

