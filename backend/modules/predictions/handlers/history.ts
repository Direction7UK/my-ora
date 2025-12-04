/**
 * Get prediction history handler
 * GET /predictions/history
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getPredictionHistory } from '../services/predictionService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const history = await getPredictionHistory(auth.userId)
    return success(history)
  } catch (err: any) {
    console.error('Error fetching prediction history:', err)
    return error('Failed to fetch prediction history', 500)
  }
}

