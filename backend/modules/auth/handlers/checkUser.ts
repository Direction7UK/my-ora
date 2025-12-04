/**
 * Check if user exists handler
 * POST /auth/check-user
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { checkUserExists } from '../services/userService'
import { z } from 'zod'

const checkUserSchema = z.object({
  email: z.string().email(),
})

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequest('Request body is required')
    }

    const body = JSON.parse(event.body)
    const validated = checkUserSchema.parse(body)

    const exists = await checkUserExists(validated.email)

    return success({ exists })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    
    console.error('Error checking user:', err)
    return error('Failed to check user', 500)
  }
}

