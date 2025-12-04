/**
 * Script to clear all DynamoDB tables
 * Run with: npx ts-node scripts/clear-dynamodb.ts
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'

const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(process.env.IS_OFFLINE || process.env.SERVERLESS_OFFLINE
      ? {
          endpoint: 'http://localhost:8000',
          credentials: {
            accessKeyId: 'local',
            secretAccessKey: 'local',
          },
        }
      : {}),
  })
)

const TABLES = {
  USERS: process.env.USERS_TABLE || 'my-ora-backend-dev-UsersTable',
  MESSAGES: process.env.MESSAGES_TABLE || 'my-ora-backend-dev-MessagesTable',
  SYMPTOMS: process.env.SYMPTOMS_TABLE || 'my-ora-backend-dev-SymptomsTable',
  LIFESCORE: process.env.LIFESCORE_TABLE || 'my-ora-backend-dev-LifeScoreTable',
  LIFESTYLE: process.env.LIFESTYLE_TABLE || 'my-ora-backend-dev-LifestyleTable',
  PREDICTIONS: process.env.PREDICTIONS_TABLE || 'my-ora-backend-dev-PredictionsTable',
  NOTIFICATIONS: process.env.NOTIFICATIONS_TABLE || 'my-ora-backend-dev-NotificationsTable',
}

async function clearTable(tableName: string) {
  console.log(`Clearing table: ${tableName}...`)
  
  try {
    // Scan all items
    const scanResult = await dynamoClient.send(
      new ScanCommand({
        TableName: tableName,
      })
    )

    if (!scanResult.Items || scanResult.Items.length === 0) {
      console.log(`  Table ${tableName} is already empty`)
      return
    }

    console.log(`  Found ${scanResult.Items.length} items to delete`)

    // Delete all items in batches
    const items = scanResult.Items || []
    const batchSize = 25 // DynamoDB batch write limit
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      // Build delete requests
      const deleteRequests = batch.map((item: any) => {
        const key: any = {}
        if (item.userId) {
          key.userId = item.userId
        }
        if (item.messageId) {
          key.messageId = item.messageId
        }
        if (item.symptomId) {
          key.symptomId = item.symptomId
        }
        if (item.predictionId) {
          key.predictionId = item.predictionId
        }
        if (item.notificationId) {
          key.notificationId = item.notificationId
        }
        
        return {
          DeleteRequest: {
            Key: key,
          },
        }
      }).filter((req: any) => Object.keys(req.DeleteRequest.Key).length > 0)

      // Delete batch
      if (deleteRequests.length > 0) {
        await dynamoClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: deleteRequests,
            },
          })
        )
      }
    }

    console.log(`  ✓ Cleared ${scanResult.Items.length} items from ${tableName}`)
  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`  Table ${tableName} does not exist, skipping...`)
    } else {
      console.error(`  ✗ Error clearing ${tableName}:`, err.message)
    }
  }
}

async function main() {
  console.log('Starting DynamoDB cleanup...\n')

  const tables = Object.values(TABLES)
  
  for (const tableName of tables) {
    await clearTable(tableName)
  }

  console.log('\n✓ DynamoDB cleanup complete!')
}

main().catch(console.error)

