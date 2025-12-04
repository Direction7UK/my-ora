/**
 * Authentication utilities
 * Validates NextAuth.js JWT tokens and extracts user information
 */

import { APIGatewayProxyEvent } from 'aws-lambda'
import jwt from 'jsonwebtoken'

export interface AuthContext {
  userId: string
  email: string
}

// NextAuth JWT secret (should match frontend NEXTAUTH_SECRET)
const nextAuthSecret = process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'

export async function getAuthContext(event: APIGatewayProxyEvent): Promise<AuthContext | null> {
  // Log all headers for debugging
  console.log('Auth headers:', {
    'X-User-Id': event.headers['X-User-Id'] || event.headers['x-user-id'],
    'Authorization': event.headers.Authorization || event.headers.authorization ? 'present' : 'missing',
    'Cookie': event.headers.Cookie || event.headers.cookie ? 'present' : 'missing',
    allHeaderKeys: Object.keys(event.headers),
  })
  
  // First, try to get userId from X-User-Id header (simpler for server-to-server calls)
  const userIdHeader = event.headers['X-User-Id'] || event.headers['x-user-id'] || 
                       (event.headers as any)?.['X-User-Id'] || (event.headers as any)?.['x-user-id']
  
  if (userIdHeader && userIdHeader.trim() !== '') {
    console.log('Using X-User-Id header for authentication:', userIdHeader)
    // For now, trust the header if it's provided (in production, always verify the token)
    // This is a temporary solution until we properly set up NextAuth token verification
    return {
      userId: userIdHeader.trim(),
      email: '', // Email not available from header
    }
  }
  
  console.log('X-User-Id header not found or empty, checking cookies...')

  // NextAuth stores session in a cookie named 'next-auth.session-token' (or 'next-auth.session-token' in production)
  // For API Gateway, we need to extract from cookies header
  const cookies = event.headers.Cookie || event.headers.cookie || ''
  
  // Extract NextAuth session token from cookies
  const sessionTokenMatch = cookies.match(/next-auth\.session-token=([^;]+)/) || 
                           cookies.match(/__Secure-next-auth\.session-token=([^;]+)/) ||
                           cookies.match(/next-auth\.session-token=([^;]+)/i)
  
  if (!sessionTokenMatch) {
    // Fallback: Check Authorization header (if using custom implementation)
    const authHeader = event.headers.Authorization || event.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      return verifyNextAuthToken(token)
    }
    return null
  }

  const sessionToken = decodeURIComponent(sessionTokenMatch[1])
  return verifyNextAuthToken(sessionToken)
}

function verifyNextAuthToken(token: string): AuthContext | null {
  try {
    // If no secret is configured, decode without verification (development only)
    if (!nextAuthSecret || nextAuthSecret === 'your-secret-key-change-in-production') {
      console.warn('NEXTAUTH_SECRET not configured, using unverified token (development mode)')
      const decoded = jwt.decode(token) as any
      if (decoded) {
        return {
          userId: decoded.id || decoded.sub || decoded.userId || 'unknown',
          email: decoded.email || '',
        }
      }
      return null
    }

    // Decode NextAuth JWT token with verification
    const decoded = jwt.verify(token, nextAuthSecret) as any
    
    if (!decoded) {
      return null
    }

    // Extract user info from NextAuth JWT payload
    // NextAuth stores user info in the token
    return {
      userId: decoded.id || decoded.sub || decoded.userId || 'unknown',
      email: decoded.email || '',
    }
  } catch (error) {
    // Token invalid or expired
    console.error('Token verification failed:', error)
    
    // Development fallback: Try to decode without verification
    if (process.env.NODE_ENV === 'development' || !nextAuthSecret) {
      try {
        const decoded = jwt.decode(token) as any
        if (decoded) {
          console.warn('Using unverified token in development mode')
          return {
            userId: decoded.id || decoded.sub || decoded.userId || 'dev-user-id',
            email: decoded.email || 'dev@example.com',
          }
        }
      } catch {
        // Invalid token
      }
    }
    
    return null
  }
}

export async function requireAuth(event: APIGatewayProxyEvent): Promise<AuthContext> {
  const context = await getAuthContext(event)
  if (!context) {
    throw new Error('Unauthorized')
  }
  return context
}

