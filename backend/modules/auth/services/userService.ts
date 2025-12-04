/**
 * User service
 * Handles user registration, authentication, and user data management
 */

import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

export interface CreateUserInput {
  email: string
  passwordHash: string
  name?: string
}

export interface User {
  userId: string
  email: string
  name?: string
  passwordHash: string
  createdAt: string
  updatedAt: string
}

export async function createUser(input: CreateUserInput): Promise<string> {
  if (!TABLES.USERS) {
    throw new Error('DYNAMODB_USERS_TABLE environment variable is not set')
  }

  const userId = uuidv4()
  const now = new Date().toISOString()

  try {
    await dynamoClient.send(
      new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          userId,
          email: input.email.toLowerCase(), // Normalize email
          name: input.name,
          passwordHash: input.passwordHash,
          createdAt: now,
          updatedAt: now,
        },
        // Prevent duplicate emails (using userId as unique constraint)
        // Note: For better duplicate prevention, use a separate check before insert
      })
    )
  } catch (err: any) {
    // Provide more helpful error messages
    if (err.name === 'ResourceNotFoundException') {
      throw new Error(
        `DynamoDB table "${TABLES.USERS}" does not exist. ` +
        `Please create the table or use DynamoDB Local. ` +
        `See SETUP.md for instructions.`
      )
    }
    if (err.name === 'UnrecognizedClientException' || err.code === 'CredentialsError') {
      throw new Error(
        `AWS credentials not configured. ` +
        `For local development, use DynamoDB Local or configure AWS credentials. ` +
        `See SETUP.md for instructions.`
      )
    }
    throw err
  }

  return userId
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // Use GSI on email for efficient lookups
  const { QueryCommand } = await import('@aws-sdk/lib-dynamodb')
  
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.USERS,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase(),
      },
      Limit: 1,
    })
  )

  if (result.Items && result.Items.length > 0) {
    return result.Items[0] as User
  }

  // Fallback to scan if GSI doesn't exist yet (for development)
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb')
  const scanResult = await dynamoClient.send(
    new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase(),
      },
      Limit: 1,
    })
  )

  if (scanResult.Items && scanResult.Items.length > 0) {
    return scanResult.Items[0] as User
  }

  return null
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await dynamoClient.send(
    new GetCommand({
      TableName: TABLES.USERS,
      Key: {
        userId,
      },
    })
  )

  if (result.Item) {
    return result.Item as User
  }

  return null
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return await bcrypt.compare(password, passwordHash)
}

export async function checkUserExists(email: string): Promise<boolean> {
  const user = await getUserByEmail(email)
  return user !== null
}

