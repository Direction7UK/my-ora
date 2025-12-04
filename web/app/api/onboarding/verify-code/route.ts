import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, code } = body

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      )
    }

    // Call backend API to verify code
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://y0rij8exse.execute-api.us-east-1.amazonaws.com'
    const stage = process.env.NEXT_PUBLIC_STAGE || 'dev'

    // Get cookies from the request to forward to backend
    const cookies = request.headers.get('cookie') || ''
    
    const response = await fetch(`${apiUrl}/${stage}/onboarding/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies, // Forward NextAuth session cookie
        'X-User-Id': session.userId, // Pass userId in header for backend
      },
      body: JSON.stringify({ phone, code, userId: session.userId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Invalid verification code' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, verified: true })
  } catch (error: any) {
    console.error('Code verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}

