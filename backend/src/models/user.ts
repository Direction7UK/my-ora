/**
 * User data model
 * Represents user profile and preferences
 */

export interface User {
  userId: string
  email: string
  name?: string
  preferences?: {
    notifications?: boolean
    reminders?: boolean
    theme?: 'light' | 'dark'
  }
  createdAt: string
  updatedAt: string
}

export interface CreateUserInput {
  userId: string
  email: string
  name?: string
}

