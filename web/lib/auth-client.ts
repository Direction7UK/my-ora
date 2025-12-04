/**
 * Client-side authentication utilities using AWS Amplify
 */

'use client'

import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'

export interface AuthUser {
  userId: string
  email: string
  username?: string
}

export async function signInUser(username: string, password: string) {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password })
    
    if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      return {
        success: false,
        requiresNewPassword: true,
        session: nextStep.additionalInfo?.session,
      }
    }
    
    if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE') {
      return {
        success: false,
        requiresMFA: true,
        session: nextStep.additionalInfo?.session,
      }
    }
    
    return {
      success: isSignedIn,
      user: isSignedIn ? await getCurrentUser() : null,
    }
  } catch (error: any) {
    console.error('Sign in error:', error)
    throw new Error(error.message || 'Failed to sign in')
  }
}

export async function signOutUser() {
  try {
    await signOut()
    return { success: true }
  } catch (error: any) {
    console.error('Sign out error:', error)
    throw new Error(error.message || 'Failed to sign out')
  }
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  try {
    const user = await getCurrentUser()
    const session = await fetchAuthSession()
    
    if (!user || !session.tokens) {
      return null
    }
    
    // Extract user info from token
    const idToken = session.tokens.idToken
    const email = idToken?.payload.email as string || idToken?.payload['cognito:username'] as string || ''
    const userId = user.userId
    
    return {
      userId,
      email,
      username: user.username,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() || null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

