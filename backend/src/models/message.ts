/**
 * Message data model
 * Represents chat messages between user and AI assistant
 */

export interface Message {
  messageId: string
  conversationId: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Conversation {
  conversationId: string
  userId: string
  title?: string
  createdAt: string
  updatedAt: string
}

