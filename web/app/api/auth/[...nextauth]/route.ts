/**
 * NextAuth.js API route handler
 * Handles all authentication requests
 */

import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// Optional: DynamoDB adapter for session storage
// Install with: npm install @next-auth/dynamodb-adapter
// import { DynamoDBAdapter } from '@next-auth/dynamodb-adapter'
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Validate credentials against backend API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://y0rij8exse.execute-api.us-east-1.amazonaws.com'
        const stage = process.env.NEXT_PUBLIC_STAGE || 'dev'
        
        try {
          const response = await fetch(`${apiUrl}/${stage}/auth/verify-credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          // Handle both { data: { valid, user } } and { valid, user } response formats
          const result = data.data || data
          
          if (result.valid && result.user) {
            return {
              id: result.user.id,
              email: result.user.email,
              name: result.user.name,
            }
          }

          return null
        } catch (error) {
          console.error('Error verifying credentials:', error)
          return null
        }
      },
    }),

    // Google OAuth (optional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  // Session configuration
  session: {
    strategy: 'jwt', // Use JWT for sessions (works well with serverless)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        (session.user as any).id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },

  // Pages customization
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },

  // Optional: Use DynamoDB for session storage (if needed)
  // adapter: DynamoDBAdapter(dynamoDBClient, {
  //   tableName: process.env.DYNAMODB_SESSIONS_TABLE || 'next-auth-sessions',
  // }),

  // Security
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

