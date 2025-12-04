'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PhoneInput } from '@/components/ui/phone-input'
import { SplitLayout } from '@/components/onboarding/split-layout'

// Step 1: Phone Verification
function PhoneVerificationStep({ 
  onNext, 
  phone, 
  setPhone, 
  countryCode, 
  setCountryCode,
  onCodeReceived 
}: { 
  onNext: (phone: string) => void
  phone: string
  setPhone: (phone: string) => void
  countryCode: string
  setCountryCode: (code: string) => void
  onCodeReceived?: (code: string) => void
}) {
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
      const response = await fetch('/api/onboarding/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send verification code')
        return
      }

      // Store verification code if returned (dev mode)
      if (data.code && onCodeReceived) {
        onCodeReceived(data.code)
      }

      onNext(fullPhone)
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's verify your phone number</h2>
          <p className="text-gray-600">Enter your phone number to receive a verification code.</p>
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
        </form>
      </div>
    </SplitLayout>
  )
}

// Step 2: Verification Code
function VerificationCodeStep({ phone, onNext, onBack, verificationCode }: { 
  phone: string
  onNext: () => void
  onBack: () => void
  verificationCode?: string
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid verification code')
        return
      }

      onNext()
    } catch (error: any) {
      setError(error.message || 'Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Enter your verification code</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to {phone}. Please enter it below to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show verification code in development */}
          {verificationCode && process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">Development Mode:</p>
              <p className="text-lg font-mono font-bold text-blue-900">Verification Code: {verificationCode}</p>
            </div>
          )}
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              maxLength={6}
              className="w-full px-3 py-2 border rounded-md text-center text-2xl tracking-widest"
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Step 3: Email Verification (Optional)
function EmailVerificationStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send verification email')
        return
      }

      setSent(true)
    } catch (error: any) {
      setError(error.message || 'Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent a verification code to {email}. You can verify it later in your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onNext} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Let's verify your email</CardTitle>
        <CardDescription>Enter your email to request a verification code (can skip)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onSkip} className="flex-1">
              Skip
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send Code'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Step 4: Coach Personalization
function CoachPersonalizationStep({ onNext }: { onNext: () => void }) {
  const [coachName, setCoachName] = useState('MyOra')
  const [selectedAvatar, setSelectedAvatar] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const avatars = [
    { id: '1', emoji: '🤖', name: 'Robot' },
    { id: '2', emoji: '👨‍⚕️', name: 'Doctor' },
    { id: '3', emoji: '🧘', name: 'Meditation' },
    { id: '4', emoji: '💪', name: 'Fitness' },
    { id: '5', emoji: '🧠', name: 'Brain' },
    { id: '6', emoji: '❤️', name: 'Heart' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachName, avatar: selectedAvatar }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save coach settings')
        return
      }

      onNext()
    } catch (error: any) {
      setError(error.message || 'Failed to save coach settings')
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Personalize Your Coach</h2>
          <p className="text-gray-600">Choose an avatar and name your coach.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-3xl">{avatars.find(a => a.id === selectedAvatar)?.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">Pick your preferred Avatar</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // Toggle through avatars or open modal
                    const currentIndex = avatars.findIndex(a => a.id === selectedAvatar)
                    const nextIndex = (currentIndex + 1) % avatars.length
                    setSelectedAvatar(avatars[nextIndex].id)
                  }}
                  className="border-gray-300 text-gray-700"
                >
                  Choose
                </Button>
              </div>
            </div>
            
            {/* Avatar Grid */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`p-4 border-2 rounded-lg text-4xl transition-all ${
                    selectedAvatar === avatar.id
                      ? 'border-[#0F5132] bg-[#0F5132]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Coach Name */}
          <div>
            <label htmlFor="coachName" className="block text-sm font-medium mb-2 text-gray-700">
              Coach Name
            </label>
            <div className="relative">
              <input
                id="coachName"
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Muna"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent"
              />
              {coachName && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-[#0F5132]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-[#0F5132] hover:bg-[#0a3d24] text-white py-3 text-base font-medium rounded-lg" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete'}
          </Button>
        </form>
      </div>
    </SplitLayout>
  )
}

// Step 5: User Profile + Password
function UserProfileStep({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    healthGoals: '',
    medicalConditions: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate password
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          healthGoals: formData.healthGoals,
          medicalConditions: formData.medicalConditions,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save profile')
        return
      }

      onComplete()
    } catch (error: any) {
      setError(error.message || 'Failed to save profile')
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Let's get to know you</h2>
          <p className="text-gray-600">Tell us more about you so MyOra can support you more effectively.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-gray-700">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-gray-700">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent"
            />
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium mb-2 text-gray-700">
              Age
            </label>
            <input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="45"
              min="1"
              max="120"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent"
            />
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium mb-2 text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 w-4 h-4 text-[#0F5132] border-gray-300 rounded focus:ring-[#0F5132]"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              By clicking 'Continue', I agree to MyOra's{' '}
              <a href="/terms" className="text-[#0F5132] hover:underline">Terms of Use</a>
              {' '}and{' '}
              <a href="/privacy" className="text-[#0F5132] hover:underline">Privacy Policy</a>.
            </label>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-[#0F5132] hover:bg-[#0a3d24] text-white py-3 text-base font-medium rounded-lg" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete'}
          </Button>
        </form>
      </div>
    </SplitLayout>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+234')
  const [verificationCode, setVerificationCode] = useState<string | undefined>()

  // Check if phone number was passed from home page
  useEffect(() => {
    const phoneParam = searchParams.get('phone')
    const codeParam = searchParams.get('code')
    
    if (phoneParam) {
      setPhone(phoneParam)
      setStep(2) // Skip to verification code step
    }
    
    if (codeParam && process.env.NODE_ENV === 'development') {
      setVerificationCode(codeParam)
    }
  }, [searchParams])

  // Allow onboarding without session for phone-first flow
  // Session will be created after phone verification

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  const handleComplete = () => {
    // After completing onboarding, redirect to login or dashboard
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth/login?onboarding=complete')
    }
  }


  return (
    <>
      {step === 1 && (
        <PhoneVerificationStep
          phone={phone}
          setPhone={setPhone}
          countryCode={countryCode}
          setCountryCode={setCountryCode}
          onNext={(phoneNumber) => {
            setPhone(phoneNumber)
            setStep(2)
          }}
          onCodeReceived={(code) => setVerificationCode(code)}
        />
      )}
      {step === 2 && (
        <VerificationCodeStep
          phone={phone}
          verificationCode={verificationCode}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <EmailVerificationStep
          onNext={() => setStep(4)}
          onSkip={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <CoachPersonalizationStep onNext={() => setStep(5)} />
      )}
      {step === 5 && <UserProfileStep onComplete={handleComplete} />}
    </>
  )
}

