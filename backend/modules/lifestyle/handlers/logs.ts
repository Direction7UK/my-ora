/**
 * Get lifestyle logs handler
 * GET /lifestyle/{type}
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { success, error, badRequest } from '../../../src/utils/response'
import { requireAuth } from '../../../src/utils/auth'
import { getLogs } from '../services/lifestyleService'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const auth = await requireAuth(event)
    const logType = event.pathParameters?.type

    if (!logType || !['meals', 'activities', 'sleep', 'stress'].includes(logType)) {
      return badRequest('Invalid log type. Must be: meals, activities, sleep, or stress')
    }

    const days = event.queryStringParameters?.days
      ? parseInt(event.queryStringParameters.days)
      : 30

    const logs = await getLogs(auth.userId, logType.slice(0, -1), days) // Remove 's' from plural
    return success(logs)
  } catch (err: any) {
    console.error('Error fetching logs:', err)
    return error('Failed to fetch logs', 500)
  }
}

