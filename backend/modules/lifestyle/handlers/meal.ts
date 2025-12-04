/**
 * Log meal handler
 * POST /lifestyle/meals
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { logMeal } from '../services/lifestyleService'

function parseMultipartFormData(
  body: string,
  contentType: string
): { image: Buffer; notes?: string } | null {
  // Extract boundary from Content-Type header
  const boundaryMatch = contentType.match(/boundary=([^;]+)/)
  if (!boundaryMatch) {
    return null
  }

  const boundary = `--${boundaryMatch[1].trim()}`
  const parts = body.split(boundary).filter((part) => part.trim() && !part.includes('--'))

  let imageBuffer: Buffer | null = null
  let notes: string | undefined

  for (const part of parts) {
    const [headers, ...contentParts] = part.split('\r\n\r\n')
    const content = contentParts.join('\r\n\r\n').trim()

    // Check if this is the image file
    if (headers.includes('name="image"') || headers.includes('filename=')) {
      // Remove trailing boundary markers
      const cleanContent = content.replace(/\r\n--$/, '').trim()
      imageBuffer = Buffer.from(cleanContent, 'binary')
    }

    // Check if this is notes
    if (headers.includes('name="notes"')) {
      notes = content.replace(/\r\n--$/, '').trim()
    }
  }

  if (!imageBuffer) {
    return null
  }

  return { image: imageBuffer, notes: notes || undefined }
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''
    
    if (!contentType.includes('multipart/form-data')) {
      return badRequest('Content-Type must be multipart/form-data')
    }

    if (!event.body) {
      return badRequest('Request body is required')
    }

    // Handle base64 encoded body (API Gateway binary support)
    let bodyString: string
    if (event.isBase64Encoded) {
      bodyString = Buffer.from(event.body, 'base64').toString('binary')
    } else {
      bodyString = event.body
    }

    const parsed = parseMultipartFormData(bodyString, contentType)
    
    if (!parsed) {
      return badRequest('Could not parse multipart form data. Please ensure an image file is included.')
    }

    // Determine content type from the image (default to jpeg)
    const imageContentType = contentType.includes('image/')
      ? contentType.split(';')[0]
      : 'image/jpeg'

    const result = await logMeal(auth.userId, parsed.image, imageContentType, parsed.notes)
    
    return success(result)
  } catch (err: any) {
    console.error('Error logging meal:', err)
    return error('Failed to log meal', 500)
  }
}

