/**
 * WhatsApp Cloud API Service
 * Handles sending messages via WhatsApp Business API
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

interface SendMessageParams {
  to: string // WhatsApp phone number (with country code, no +)
  message: string
  phoneNumberId?: string
}

/**
 * Send a text message via WhatsApp Cloud API
 */
export async function sendWhatsAppMessage({
  to,
  message,
  phoneNumberId,
}: SendMessageParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const defaultPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || phoneNumberId

  if (!accessToken) {
    console.error('WhatsApp access token not configured')
    return { success: false, error: 'WhatsApp access token not configured' }
  }

  if (!defaultPhoneNumberId) {
    console.error('WhatsApp phone number ID not configured')
    return { success: false, error: 'WhatsApp phone number ID not configured' }
  }

  // Remove + and any spaces from phone number
  const cleanPhoneNumber = to.replace(/[\s+]/g, '')

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${defaultPhoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhoneNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    )

    const data = (await response.json()) as any

    if (!response.ok) {
      console.error('WhatsApp API error:', data)
      return {
        success: false,
        error: data.error?.message || 'Failed to send WhatsApp message',
      }
    }

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    }
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error)
    return {
      success: false,
      error: error.message || 'Failed to send WhatsApp message',
    }
  }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string): Promise<boolean> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!accessToken || !phoneNumberId) {
    return false
  }

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      }
    )

    return response.ok
  } catch (error) {
    console.error('Error marking message as read:', error)
    return false
  }
}

