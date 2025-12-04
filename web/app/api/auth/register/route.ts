/**
 * User registration API endpoint
 * Creates new user accounts with password hashing
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Registration schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await checkUserExists(validated.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user in database (password will be hashed by backend)
    const userId = await createUser({
      email: validated.email,
      password: validated.password, // Send plain password, backend will hash it
      name: validated.name,
    })

    return NextResponse.json(
      { 
        success: true, 
        userId,
        message: 'User created successfully. Please sign in.' 
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create user account',
        message: error.message || 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

async function checkUserExists(email: string): Promise<boolean> {
  // Call backend API to check if user exists
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://y0rij8exse.execute-api.us-east-1.amazonaws.com'
  const stage = process.env.NEXT_PUBLIC_STAGE || 'dev'
  
  try {
    const response = await fetch(`${apiUrl}/${stage}/auth/check-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.data?.exists || data.exists || false
    }
    
    // If backend is not available, return false (allow registration to proceed)
    // In production, you might want to handle this differently
    console.warn('Backend check-user endpoint not available, proceeding with registration')
    return false
  } catch (error) {
    console.error('Error checking user existence:', error)
    // If backend is down, allow registration to proceed
    // The backend will check for duplicates anyway
    return false
  }
}

async function createUser(userData: {
  email: string
  password: string
  name?: string
}): Promise<string> {
  // Call backend API to create user
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://y0rij8exse.execute-api.us-east-1.amazonaws.com'
  // Serverless offline uses /dev prefix for the stage
  const stage = process.env.NEXT_PUBLIC_STAGE || 'dev'
  
  try {
    const response = await fetch(`${apiUrl}/${stage}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch {
        // If response is not JSON, use status text
        errorData = { 
          error: `Backend returned ${response.status}: ${response.statusText}`,
          message: `HTTP ${response.status} ${response.statusText}`
        }
      }
      
      // Handle serverless offline route not found
      if (response.status === 404 && errorData.error?.includes('route not found')) {
        throw new Error(
          `Backend route not found. Please restart serverless offline: ${errorData.error}`
        )
      }
      
      throw new Error(
        errorData.error || 
        errorData.message || 
        `Backend error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    // Handle both { success: true, data: { userId } } and { userId } response formats
    const userId = data.data?.userId || data.userId || data.data?.data?.userId
    
    if (!userId) {
      console.error('Unexpected response format:', data)
      throw new Error('Backend did not return a userId. Response: ' + JSON.stringify(data))
    }
    
    return userId
  } catch (error: any) {
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to connect to backend: ${error.message || 'Unknown error'}`)
  }
}

