/**
 * User registration handler
 * POST /auth/register
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { createUser } from '../services/userService'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequest('Request body is required')
    }

    const body = JSON.parse(event.body)
    const validated = registerSchema.parse(body)

    // Check if user already exists
    const { checkUserExists } = await import('../services/userService')
    const exists = await checkUserExists(validated.email)
    
    if (exists) {
      return badRequest('User with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 10)

    // Create user
    const userId = await createUser({
      email: validated.email,
      passwordHash,
      name: validated.name,
    })

    return success({ userId })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return badRequest('Invalid request data', err.errors)
    }
    
    if (err.name === 'ConditionalCheckFailedException') {
      return badRequest('User with this email already exists')
    }
    
    // Log full error details for debugging
    console.error('Error registering user:', {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
      tableName: process.env.DYNAMODB_USERS_TABLE,
    })
    
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to register user: ${err.message || err.name || 'Unknown error'}`
      : 'Failed to register user'
    
    return error(errorMessage, 500, process.env.NODE_ENV === 'development' ? {
      name: err.name,
      code: err.code,
      tableName: process.env.DYNAMODB_USERS_TABLE,
    } : undefined)
  }
}

