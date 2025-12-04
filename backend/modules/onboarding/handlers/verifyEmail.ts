/**
 * Email verification handler
 * POST /onboarding/verify-email
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { sendVerificationCode } from '../services/verificationService'
import { requireAuth } from '../../../src/utils/auth'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  email: z.string().email(),
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
    const validated = verifyEmailSchema.parse({
      ...body,
      userId: authContext.userId,
    })

    // Send verification code via email
    const result = await sendVerificationCode(validated.email, validated.userId, 'email')

    return success({
      message: 'Verification code sent to email',
      expiresIn: 300, // 5 minutes
    })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    
    console.error('Error sending email verification code:', err)
    return error('Failed to send verification email', 500)
  }
}

