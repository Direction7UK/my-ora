/**
 * Symptom history handler
 * GET /symptoms/history
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getSymptomHistory } from '../services/symptomService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const history = await getSymptomHistory(auth.userId)
    return success(history)
  } catch (err: any) {
    console.error('Error fetching symptom history:', err)
    return error('Failed to fetch symptom history', 500)
  }
}

