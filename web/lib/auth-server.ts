/**
 * NextAuth.js server-side authentication utilities
 */

import { getServerSession as nextAuthGetServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function getServerSession() {
  try {
    const session = await nextAuthGetServerSession(authOptions)
    
    if (!session?.user) {
      return null
    }

    return {
      userId: (session.user as any).id || '',
      email: session.user.email || '',
      name: session.user.name || undefined,
    }
  } catch (error) {
    console.error('Error getting server session:', error)
    return null
  }
}

export function getApiHeaders(session?: any): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  // NextAuth session is handled via cookies
  // The backend will validate the session cookie
  if (session) {
    // You can add session info to headers if needed
    headers['X-User-Id'] = session.userId
  }
  
  return headers
}

