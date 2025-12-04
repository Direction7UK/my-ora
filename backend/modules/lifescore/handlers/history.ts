/**
 * Get LifeScore history handler
 * GET /lifescore/history
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getLifeScoreHistory } from '../services/lifescoreService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const days = event.queryStringParameters?.days
      ? parseInt(event.queryStringParameters.days)
      : 30
    
    const history = await getLifeScoreHistory(auth.userId, days)
    return success(history)
  } catch (err: any) {
    console.error('Error fetching LifeScore history:', err)
    return error('Failed to fetch LifeScore history', 500)
  }
}

