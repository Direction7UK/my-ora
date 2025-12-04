/**
 * Chat service
 * Handles AI chat interactions using OpenAI
 */

import { OpenAI } from 'openai'
import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function sendMessage(
  userId: string,
  message: string,
  conversationId?: string
): Promise<{ messageId: string; response: string; conversationId: string }> {
  // Get conversation history if conversationId exists
  let conversationHistory: ChatMessage[] = []
  
  if (conversationId) {
    const history = await getConversationHistory(conversationId)
    conversationHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  } else {
    conversationId = uuidv4()
  }

  // Add user message to history
  conversationHistory.push({ role: 'user', content: message })

  // Call OpenAI API
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful health assistant for MyOra. Provide accurate, empathetic health guidance. Always remind users to consult healthcare professionals for serious concerns.',
      },
      ...conversationHistory,
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  const assistantResponse = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.'

  // Save messages to DynamoDB
  const userMessageId = uuidv4()
  const assistantMessageId = uuidv4()

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.MESSAGES,
      Item: {
        conversationId,
        messageId: userMessageId,
        userId,
        role: 'user',
        content: message,
        createdAt: new Date().toISOString(),
      },
    })
  )

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.MESSAGES,
      Item: {
        conversationId,
        messageId: assistantMessageId,
        userId,
        role: 'assistant',
        content: assistantResponse,
        createdAt: new Date().toISOString(),
      },
    })
  )

  return {
    messageId: assistantMessageId,
    response: assistantResponse,
    conversationId,
  }
}

async function getConversationHistory(conversationId: string) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'conversationId = :conversationId',
      ExpressionAttributeValues: {
        ':conversationId': conversationId,
      },
      ScanIndexForward: true, // Sort by messageId ascending (chronological)
    })
  )

  return (result.Items || []) as Array<{
    role: 'user' | 'assistant'
    content: string
    createdAt: string
  }>
}

export async function getConversations(userId: string) {
  // Get all unique conversation IDs for this user
  // Since messages table has userId in items, we use Scan with filter
  // In production, create a conversations table with userId as partition key or use GSI
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb')
  
  const result = await dynamoClient.send(
    new ScanCommand({
      TableName: TABLES.MESSAGES,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  )

  // Group messages by conversationId and get the most recent message for each
  const conversationsMap = new Map<string, { conversationId: string; updatedAt: string; title?: string }>()
  
  if (result.Items && result.Items.length > 0) {
    for (const item of result.Items) {
      if (!conversationsMap.has(item.conversationId)) {
        // Extract a title from the first user message (first 50 chars)
        const firstUserMessage = result.Items.find(
          (m) => m.conversationId === item.conversationId && m.role === 'user'
        )
        const title = firstUserMessage?.content?.substring(0, 50) || 'New Conversation'
        
        conversationsMap.set(item.conversationId, {
          conversationId: item.conversationId,
          updatedAt: item.createdAt,
          title: title.length < 50 ? title : title + '...',
        })
      } else {
        // Update if this message is more recent
        const existing = conversationsMap.get(item.conversationId)!
        if (new Date(item.createdAt) > new Date(existing.updatedAt)) {
          existing.updatedAt = item.createdAt
        }
      }
    }
  }

  // Convert to array and sort by updatedAt
  return Array.from(conversationsMap.values())
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((conv) => ({
      id: conv.conversationId,
      title: conv.title,
      updatedAt: conv.updatedAt,
    }))
}

export async function getMessages(conversationId: string, userId: string) {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLES.MESSAGES,
      KeyConditionExpression: 'conversationId = :conversationId',
      ExpressionAttributeValues: {
        ':conversationId': conversationId,
      },
      ScanIndexForward: true,
    })
  )

  const messages = (result.Items || []).filter((item) => item.userId === userId)
  return messages.map((msg) => ({
    id: msg.messageId,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
  }))
}

