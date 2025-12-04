/**
 * Get current LifeScore handler
 * GET /lifescore/current
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getCurrentLifeScore } from '../services/lifescoreService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const score = await getCurrentLifeScore(auth.userId)
    return success(score)
  } catch (err: any) {
    console.error('Error fetching LifeScore:', err)
    return error('Failed to fetch LifeScore', 500)
  }
}

