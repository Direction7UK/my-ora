import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Call backend API to send verification code
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://y0rij8exse.execute-api.us-east-1.amazonaws.com'
    const stage = process.env.NEXT_PUBLIC_STAGE || 'dev'

    // Get cookies from the request to forward to backend
    const cookies = request.headers.get('cookie') || ''
    
    // Log for debugging
    console.log('Onboarding verify-phone:', {
      userId: session.userId,
      hasCookies: !!cookies,
      cookieLength: cookies.length,
    })
    
    const response = await fetch(`${apiUrl}/${stage}/onboarding/verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies, // Forward NextAuth session cookie
        'X-User-Id': session.userId || '', // Pass userId in header for backend
      },
      body: JSON.stringify({ phone, userId: session.userId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to send verification code' },
        { status: response.status }
      )
    }

    // In development, return the code for testing
    const responseData: any = { success: true, message: 'Verification code sent' }
    if (process.env.NODE_ENV === 'development' && data.data?.code) {
      responseData.code = data.data.code
    }

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error('Phone verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}

