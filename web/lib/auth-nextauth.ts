/**
 * NextAuth.js authentication utilities
 * Client-side and server-side auth helpers
 */

'use client'

import { signIn, signOut, useSession, getSession } from 'next-auth/react'
import { Session } from 'next-auth'

export interface AuthUser {
  userId: string
  email: string
  name?: string
}

// Client-side: Sign in with credentials
export async function signInUser(email: string, password: string) {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    return {
      success: result?.ok || false,
      error: result?.error || null,
    }
  } catch (error: any) {
    console.error('Sign in error:', error)
    throw new Error(error.message || 'Failed to sign in')
  }
}

// Client-side: Sign in with Google
export async function signInWithGoogle() {
  try {
    await signIn('google', { callbackUrl: '/dashboard' })
  } catch (error: any) {
    console.error('Google sign in error:', error)
    throw new Error(error.message || 'Failed to sign in with Google')
  }
}

// Client-side: Sign out
export async function signOutUser() {
  try {
    await signOut({ redirect: true, callbackUrl: '/auth/login' })
    return { success: true }
  } catch (error: any) {
    console.error('Sign out error:', error)
    throw new Error(error.message || 'Failed to sign out')
  }
}

// Client-side: Get current user (hook)
export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user ? {
      userId: session.user.id || '',
      email: session.user.email || '',
      name: session.user.name || undefined,
    } : null,
    loading: status === 'loading',
    authenticated: status === 'authenticated',
  }
}

// Client-side: Get current user (function)
export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  try {
    const session = await getSession()
    if (!session?.user) {
      return null
    }

    return {
      userId: session.user.id || '',
      email: session.user.email || '',
      name: session.user.name || undefined,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Client-side: Get auth token
export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await getSession()
    // NextAuth doesn't expose the JWT directly to the client
    // We'll need to get it from the session cookie or API route
    // For now, return null and handle auth via session
    return session ? 'authenticated' : null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

