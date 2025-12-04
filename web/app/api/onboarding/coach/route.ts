import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { coachName, avatar } = body

    if (!coachName) {
      return NextResponse.json({ error: 'Coach name is required' }, { status: 400 })
    }

    // Call backend API to save coach settings
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://y0rij8exse.execute-api.us-east-1.amazonaws.com'
    const stage = process.env.NEXT_PUBLIC_STAGE || 'dev'

    // Get cookies from the request to forward to backend
    const cookies = request.headers.get('cookie') || ''
    
    const response = await fetch(`${apiUrl}/${stage}/onboarding/coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies, // Forward NextAuth session cookie
        'X-User-Id': session.userId, // Pass userId in header for backend
      },
      body: JSON.stringify({ coachName, avatar, userId: session.userId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to save coach settings' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Coach setup error:', error)
    return NextResponse.json(
      { error: 'Failed to save coach settings' },
      { status: 500 }
    )
  }
}

