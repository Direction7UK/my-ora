/**
 * Verify user credentials handler
 * POST /auth/verify-credentials
 * Used by NextAuth to validate login credentials
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { getUserByEmail, verifyPassword } from '../services/userService'
import { z } from 'zod'

const verifySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequest('Request body is required')
    }

    const body = JSON.parse(event.body)
    const validated = verifySchema.parse(body)

    // Get user by email
    const user = await getUserByEmail(validated.email)
    
    if (!user) {
      return success({ valid: false, message: 'Invalid credentials' })
    }

    // Verify password
    const isValid = await verifyPassword(validated.password, user.passwordHash)
    
    if (!isValid) {
      return success({ valid: false, message: 'Invalid credentials' })
    }

    // Return user info (without password hash)
    return success({
      valid: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
      },
    })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    
    console.error('Error verifying credentials:', err)
    return error('Failed to verify credentials', 500)
  }
}

