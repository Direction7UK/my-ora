'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhoneInput } from '@/components/ui/phone-input'
import { SplitLayout } from '@/components/onboarding/split-layout'

export default function SignUpPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+234')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fullPhone = countryCode + phone
    if (!phone || phone.length < 7) {
      setError('Please enter a valid phone number')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send verification code')
        return
      }

      // Redirect to onboarding with phone number, verification code, and tempUserId
      const params = new URLSearchParams({
        phone: fullPhone,
      })
      if (data.code) {
        params.append('code', data.code)
      }
      if (data.tempUserId) {
        params.append('tempUserId', data.tempUserId)
      }
      router.push(`/onboarding?${params.toString()}`)
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SplitLayout>
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0F5132]">MyOra</h1>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's get you started</h2>
          <p className="text-gray-600">Enter your phone number to get started</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            placeholder="(555) 000-0000"
            required
          />
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-[#0F5132] hover:bg-[#0a3d24] text-white py-3 text-base font-medium rounded-lg" 
            disabled={loading || !phone || phone.length < 7}
          >
            {loading ? 'Sending code...' : 'Continue'}
          </Button>
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#0F5132] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </SplitLayout>
  )
}

