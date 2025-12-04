/**
 * Get current prediction handler
 * GET /predictions/current
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getCurrentPrediction } from '../services/predictionService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const prediction = await getCurrentPrediction(auth.userId)
    return success(prediction)
  } catch (err: any) {
    console.error('Error fetching prediction:', err)
    return error('Failed to fetch prediction', 500)
  }
}

