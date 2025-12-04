import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Call backend API to send verification code (no auth required for signup)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://y0rij8exse.execute-api.us-east-1.amazonaws.com'
    const stage = process.env.NEXT_PUBLIC_STAGE || 'dev'
    
    const response = await fetch(`${apiUrl}/${stage}/auth/verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
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
    if (data.data?.tempUserId) {
      responseData.tempUserId = data.data.tempUserId
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

