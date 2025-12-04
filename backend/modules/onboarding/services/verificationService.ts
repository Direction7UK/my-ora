/**
 * Verification service
 * Handles sending and verifying SMS/Email codes
 */

import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

// For production, integrate with:
// - AWS SNS for SMS
// - AWS SES for Email
// - Twilio for SMS (alternative)
// - SendGrid for Email (alternative)

interface VerificationCode {
  codeId: string
  contact: string // phone or email
  code: string
  userId: string
  type: 'phone' | 'email'
  expiresAt: string
  verified: boolean
  createdAt: string
}

/**
 * Generate a 6-digit verification code
 */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send verification code via SMS or Email
 */
export async function sendVerificationCode(
  contact: string,
  userId: string,
  type: 'phone' | 'email'
): Promise<{ code: string }> {
  const code = generateCode()
  const codeId = uuidv4()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes

  // Store verification code in DynamoDB
  // Using a composite key: userId#contact as the key
  const verificationKey = `VERIFICATION#${userId}#${contact}`
  
  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.USERS,
      Item: {
        userId: verificationKey, // Use composite key as userId
        email: `verification-${codeId}@temp.local`, // Temporary email for GSI
        codeId,
        contact,
        code,
        ownerUserId: userId, // Store actual userId separately
        type,
        expiresAt: expiresAt.toISOString(),
        verified: false,
        createdAt: now.toISOString(),
        ttl: Math.floor(expiresAt.getTime() / 1000), // TTL for auto-cleanup
      },
    })
  )

  // TODO: Send actual SMS/Email
  // For SMS: Use AWS SNS or Twilio
  // For Email: Use AWS SES or SendGrid
  
  if (type === 'phone') {
    // Mock SMS sending - replace with actual SMS service
    console.log(`[MOCK SMS] Verification code for ${contact}: ${code}`)
    // Example with AWS SNS:
    // const sns = new SNSClient({ region: 'us-east-1' })
    // await sns.send(new PublishCommand({
    //   PhoneNumber: contact,
    //   Message: `Your MyOra verification code is: ${code}. Valid for 5 minutes.`,
    // }))
  } else {
    // Mock Email sending - replace with actual email service
    console.log(`[MOCK EMAIL] Verification code for ${contact}: ${code}`)
    // Example with AWS SES:
    // const ses = new SESClient({ region: 'us-east-1' })
    // await ses.send(new SendEmailCommand({
    //   Source: 'noreply@myora.com',
    //   Destination: { ToAddresses: [contact] },
    //   Message: {
    //     Subject: { Data: 'MyOra Verification Code' },
    //     Body: { Text: { Data: `Your verification code is: ${code}. Valid for 5 minutes.` } },
    //   },
    // }))
  }

  // Return code for development/testing purposes
  return { code }
}

/**
 * Verify a code
 */
export async function verifyCode(
  contact: string,
  code: string,
  userId: string,
  type: 'phone' | 'email'
): Promise<boolean> {
  // Get the verification code using composite key
  const verificationKey = `VERIFICATION#${userId}#${contact}`
  
  const result = await dynamoClient.send(
    new GetCommand({
      TableName: TABLES.USERS,
      Key: {
        userId: verificationKey,
      },
    })
  )

  if (!result.Item) {
    return false
  }

  const verification = result.Item as any
  
  // Verify it belongs to the correct user and type
  if (verification.ownerUserId !== userId || verification.type !== type) {
    return false
  }

  // Check if code matches
  if (verification.code !== code) {
    return false
  }

  // Check if expired
  const expiresAt = new Date(verification.expiresAt)
  if (expiresAt < new Date()) {
    return false
  }

  // Mark as verified (reuse verificationKey)
  await dynamoClient.send(
    new UpdateCommand({
      TableName: TABLES.USERS,
      Key: {
        userId: verificationKey,
      },
      UpdateExpression: 'SET verified = :verified',
      ExpressionAttributeValues: {
        ':verified': true,
      },
    })
  )

  // Update user's verified contact
  const updateExpression = type === 'phone' 
    ? 'SET phoneVerified = :verified, phone = :contact'
    : 'SET emailVerified = :verified, email = :contact'
    
  await dynamoClient.send(
    new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { userId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ':verified': true,
        ':contact': contact,
      },
    })
  )

  return true
}

