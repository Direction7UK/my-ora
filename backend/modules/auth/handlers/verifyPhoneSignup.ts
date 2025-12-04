/**
 * Phone verification handler for signup (no auth required)
 * POST /auth/verify-phone
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { sendVerificationCode } from '../../onboarding/services/verificationService'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const verifyPhoneSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .refine((val) => {
      // Remove all non-digit characters except +
      const cleaned = val.replace(/[^\d+]/g, '')
      // Must start with + and have 10-15 digits total
      return cleaned.startsWith('+') && /^\+\d{10,15}$/.test(cleaned)
    }, 'Phone number must start with + and country code (e.g., +1234567890)'),
})

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequest('Request body is required')
    }

    const body = JSON.parse(event.body)
    
    // Clean phone number: remove spaces, dashes, parentheses
    const cleanedPhone = body.phone ? body.phone.replace(/[\s\-\(\)]/g, '') : body.phone
    
    const validated = verifyPhoneSchema.parse({
      phone: cleanedPhone,
    })

    // Generate a temporary userId for signup flow
    // This will be used to store the verification code
    // The actual user will be created after phone verification
    const tempUserId = `temp-${uuidv4()}`

    // Send verification code via SMS
    const result = await sendVerificationCode(validated.phone, tempUserId, 'phone')

    return success({
      message: 'Verification code sent',
      expiresIn: 300, // 5 minutes
      tempUserId, // Return temp userId for signup flow
      // Include code in development mode for testing
      code: process.env.NODE_ENV === 'development' ? result.code : undefined,
    })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      console.error('Validation error:', err.errors)
      // Return more user-friendly error message
      const phoneError = err.errors?.find((e: any) => e.path?.includes('phone'))
      const errorMessage = phoneError 
        ? `Invalid phone number: ${phoneError.message}. Please use format +1234567890`
        : 'Invalid request data'
      return badRequest(errorMessage, err.errors)
    }
    
    console.error('Error sending phone verification code:', err)
    return error('Failed to send verification code', 500)
  }
}

