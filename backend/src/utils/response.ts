/**
 * Standardized API response utilities
 * Ensures consistent response format across all Lambda handlers
 */

export interface ApiResponse<T = any> {
  statusCode: number
  headers: Record<string, string>
  body: string
}

export function success<T>(data: T, statusCode: number = 200): ApiResponse<T> {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify({
      success: true,
      data,
    }),
  }
}

export function error(
  message: string,
  statusCode: number = 500,
  details?: any
): ApiResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify({
      success: false,
      error: message,
      details,
    }),
  }
}

export function unauthorized(message: string = 'Unauthorized'): ApiResponse {
  return error(message, 401)
}

export function badRequest(message: string = 'Bad Request', details?: any): ApiResponse {
  return error(message, 400, details)
}

export function notFound(message: string = 'Not Found'): ApiResponse {
  return error(message, 404)
}

