/**
 * WhatsApp webhook handler
 * Handles incoming messages from WhatsApp Cloud API
 * GET /whatsapp/webhook (verification)
 * POST /whatsapp/webhook (messages)
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../../src/utils/response'
import { markMessageAsRead } from '../services/whatsappService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Webhook verification (GET request)
    if (event.httpMethod === 'GET') {
      const mode = event.queryStringParameters?.['hub.mode']
      const token = event.queryStringParameters?.['hub.verify_token']
      const challenge = event.queryStringParameters?.['hub.challenge']

      console.log('WhatsApp webhook verification:', { mode, token: token ? 'present' : 'missing' })

      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        console.log('Webhook verified successfully')
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'text/plain',
          },
          body: challenge || '',
        }
      }

      console.error('Webhook verification failed: Invalid token or mode')
      return error('Invalid verification token', 403)
    }

    // Handle incoming messages (POST request)
    if (event.httpMethod === 'POST') {
      if (!event.body) {
        return badRequest('Request body is required')
      }

      const body = JSON.parse(event.body)
      
      console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))
      
      // Process WhatsApp message
      // WhatsApp Cloud API webhook format
      if (body.entry && body.entry.length > 0) {
        for (const entry of body.entry) {
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              const value = change.value
              
              // Handle status updates (message delivered, read, etc.)
              if (value.statuses && value.statuses.length > 0) {
                for (const status of value.statuses) {
                  console.log('Message status update:', {
                    messageId: status.id,
                    status: status.status,
                    recipient: status.recipient_id,
                  })
                }
                continue
              }

              // Handle incoming messages
              if (value.messages && value.messages.length > 0) {
                for (const message of value.messages) {
                  const senderId = value.contacts?.[0]?.wa_id || message.from
                  const messageId = message.id
                  const messageType = message.type
                  
                  // Extract message text based on type
                  let messageText = ''
                  if (messageType === 'text') {
                    messageText = message.text?.body || ''
                  } else if (messageType === 'interactive') {
                    // Handle button responses, list selections, etc.
                    messageText = message.interactive?.button_reply?.title || 
                                 message.interactive?.list_reply?.title || 
                                 `[${messageType}]`
                  } else {
                    messageText = `[${messageType}]`
                  }
                  
                  // Mark message as read
                  if (messageId) {
                    await markMessageAsRead(messageId)
                  }
                  
                  // Route to chat service
                  try {
                    const { sendMessage } = await import('../../../chat/services/chatService')
                    
                    // Use senderId as userId (in production, map WhatsApp number to user account)
                    const result = await sendMessage(senderId, messageText)
                    
                    console.log('WhatsApp message processed:', {
                      senderId,
                      messageId,
                      messageType,
                      messageText: messageText.substring(0, 50),
                      conversationId: result.conversationId,
                    })
                    
                    // TODO: Send AI response back to WhatsApp
                    // This can be done by calling sendWhatsAppMessage from whatsappService
                  } catch (err: any) {
                    console.error('Error processing WhatsApp message:', err)
                  }
                }
              }
            }
          }
        }
      }

      // Always return 200 to acknowledge receipt
      return success({ received: true })
    }

    return error('Method not allowed', 405)
  } catch (err: any) {
    console.error('Error handling WhatsApp webhook:', err)
    // Still return 200 to prevent WhatsApp from retrying
    return success({ received: true, error: err.message })
  }
}

