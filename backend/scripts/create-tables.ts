/**
 * Script to create DynamoDB tables in DynamoDB Local
 * Run with: npx ts-node scripts/create-tables.ts
 */

import { DynamoDBClient, CreateTableCommand, ScalarAttributeType, KeyType, BillingMode, ProjectionType } from '@aws-sdk/client-dynamodb'

const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
const region = process.env.REGION || 'us-east-1'
const stage = process.env.STAGE || 'dev'
const service = 'my-ora-backend'

const client = new DynamoDBClient({
  region,
  endpoint,
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
})

const tables = [
  {
    TableName: `${service}-users-${stage}`,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'email', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as BillingMode,
  },
  {
    TableName: `${service}-messages-${stage}`,
    KeySchema: [
      { AttributeName: 'messageId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'messageId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'conversationId', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
      },
      {
        IndexName: 'conversationId-index',
        KeySchema: [
          { AttributeName: 'conversationId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as BillingMode,
  },
  {
    TableName: `${service}-symptoms-${stage}`,
    KeySchema: [
      { AttributeName: 'symptomId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'symptomId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as BillingMode,
  },
  {
    TableName: `${service}-predictions-${stage}`,
    KeySchema: [
      { AttributeName: 'predictionId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'predictionId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as BillingMode,
  },
  {
    TableName: `${service}-lifescore-${stage}`,
    KeySchema: [
      { AttributeName: 'lifescoreId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'lifescoreId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as BillingMode,
  },
  {
    TableName: `${service}-lifestyle-${stage}`,
    KeySchema: [
      { AttributeName: 'lifestyleId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'lifestyleId', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'userId', AttributeType: 'S' as ScalarAttributeType },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' as KeyType },
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as BillingMode,
  },
  {
    TableName: `${service}-admin-${stage}`,
    KeySchema: [
      { AttributeName: 'adminId', KeyType: 'HASH' as KeyType },
    ],
    AttributeDefinitions: [
      { AttributeName: 'adminId', AttributeType: 'S' as ScalarAttributeType },
    ],
    BillingMode: 'PAY_PER_REQUEST' as BillingMode,
  },
]

async function createTables() {
  console.log(`🚀 Creating tables in DynamoDB Local at ${endpoint}...`)
  console.log(`   Stage: ${stage}`)
  console.log(`   Service: ${service}\n`)

  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table))
      console.log(`✅ Created table: ${table.TableName}`)
    } catch (error: any) {
      if (error.name === 'ResourceInUseException') {
        console.log(`⚠️  Table already exists: ${table.TableName}`)
      } else {
        console.error(`❌ Error creating table ${table.TableName}:`, error.message)
      }
    }
  }

  console.log('\n✅ Done!')
}

createTables().catch(console.error)

