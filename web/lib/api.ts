/**
 * API client for backend Lambda functions
 * All API calls go through this centralized client
 */

// Use deployed API by default, fallback to localhost for local development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://y0rij8exse.execute-api.us-east-1.amazonaws.com'
const API_STAGE = process.env.NEXT_PUBLIC_STAGE || 'dev'

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message)
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Add stage prefix for serverless offline
  const url = `${API_URL}/${API_STAGE}${endpoint}`
  
  // NextAuth handles authentication via cookies
  // The session cookie is automatically sent with requests
  // Backend will validate the session cookie
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  // Include credentials to send cookies
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Important: sends cookies with request
  }
  
  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new ApiError(response.status, error.message || 'API request failed', error)
  }

  return response.json()
}

export const api = {
  // Chat endpoints
  chat: {
    sendMessage: (message: string, conversationId?: string) =>
      fetchApi<{ messageId: string; response: string; conversationId: string }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversationId }),
      }),
    getConversations: () =>
      fetchApi<Array<{ id: string; title: string; updatedAt: string }>>('/chat/conversations'),
    getMessages: (conversationId: string) =>
      fetchApi<Array<{ id: string; role: 'user' | 'assistant'; content: string; createdAt: string }>>(
        `/chat/conversations/${conversationId}/messages`
      ),
  },

  // Symptom checker
  symptoms: {
    check: (symptoms: string[]) =>
      fetchApi<{ analysis: string; recommendations: string[]; urgency: 'low' | 'medium' | 'high' }>(
        '/symptoms/check',
        {
          method: 'POST',
          body: JSON.stringify({ symptoms }),
        }
      ),
    getHistory: () =>
      fetchApi<Array<{ id: string; symptoms: string[]; createdAt: string; urgency: string }>>(
        '/symptoms/history'
      ),
  },

  // LifeScore
  lifescore: {
    getCurrent: () =>
      fetchApi<{ move: number; fuel: number; recharge: number; overall: number; updatedAt: string }>(
        '/lifescore/current'
      ),
    getHistory: (days?: number) =>
      fetchApi<Array<{ date: string; move: number; fuel: number; recharge: number; overall: number }>>(
        `/lifescore/history${days ? `?days=${days}` : ''}`
      ),
  },

  // Lifestyle logging
  lifestyle: {
    logMeal: (image: File, notes?: string) => {
      const formData = new FormData()
      formData.append('image', image)
      if (notes) formData.append('notes', notes)
      return fetchApi<{ id: string; nutrition: any; createdAt: string }>('/lifestyle/meals', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      })
    },
    logActivity: (data: { type: string; duration: number; intensity: string }) =>
      fetchApi<{ id: string; createdAt: string }>('/lifestyle/activities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logSleep: (data: { hours: number; quality: string }) =>
      fetchApi<{ id: string; createdAt: string }>('/lifestyle/sleep', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logStress: (data: { level: number; notes?: string }) =>
      fetchApi<{ id: string; createdAt: string }>('/lifestyle/stress', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getLogs: (type: 'meals' | 'activities' | 'sleep' | 'stress', days?: number) =>
      fetchApi<any[]>(`/lifestyle/${type}${days ? `?days=${days}` : ''}`),
  },

  // Predictions
  predictions: {
    getCurrent: () =>
      fetchApi<{ riskScore: number; factors: string[]; recommendations: string[]; updatedAt: string }>(
        '/predictions/current'
      ),
    getHistory: () =>
      fetchApi<Array<{ id: string; riskScore: number; createdAt: string; factors: string[] }>>(
        '/predictions/history'
      ),
  },

  // Notifications
  notifications: {
    getAll: () =>
      fetchApi<Array<{ id: string; type: string; title: string; message: string; read: boolean; createdAt: string }>>(
        '/notifications'
      ),
    markRead: (id: string) =>
      fetchApi<void>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () =>
      fetchApi<void>('/notifications/read-all', { method: 'POST' }),
  },

  // Profile
  profile: {
    get: () =>
      fetchApi<{ id: string; email: string; name?: string; preferences: any }>('/profile'),
    update: (data: { name?: string; preferences?: any }) =>
      fetchApi<{ id: string }>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
}

