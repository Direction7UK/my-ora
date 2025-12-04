/**
 * DynamoDB client and utility functions
 * Centralized database access layer
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// Configure DynamoDB client for local development
const dynamoConfig: any = {
  region: process.env.REGION || 'us-east-1',
}

// Use DynamoDB Local endpoint if running offline
if (process.env.IS_OFFLINE || process.env.SERVERLESS_OFFLINE) {
  dynamoConfig.endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
  dynamoConfig.credentials = {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  }
}

const client = new DynamoDBClient(dynamoConfig)

export const dynamoClient = DynamoDBDocumentClient.from(client)

export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || '',
  MESSAGES: process.env.DYNAMODB_MESSAGES_TABLE || '',
  SYMPTOMS: process.env.DYNAMODB_SYMPTOMS_TABLE || '',
  PREDICTIONS: process.env.DYNAMODB_PREDICTIONS_TABLE || '',
  LIFESCORE: process.env.DYNAMODB_LIFESCORE_TABLE || '',
  LIFESTYLE: process.env.DYNAMODB_LIFESTYLE_TABLE || '',
  ADMIN: process.env.DYNAMODB_ADMIN_TABLE || '',
}

