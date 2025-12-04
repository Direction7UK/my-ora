'use client'

import { useState } from 'react'

interface CountryCode {
  code: string
  country: string
  flag: string
}

const COUNTRY_CODES: CountryCode[] = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+234', country: 'NG', flag: '🇳🇬' },
  // { code: '+91', country: 'IN', flag: '🇮🇳' },
  // { code: '+86', country: 'CN', flag: '🇨🇳' },
  // { code: '+81', country: 'JP', flag: '🇯🇵' },
  // { code: '+49', country: 'DE', flag: '🇩🇪' },
  // { code: '+33', country: 'FR', flag: '🇫🇷' },
  // { code: '+39', country: 'IT', flag: '🇮🇹' },
  // { code: '+34', country: 'ES', flag: '🇪🇸' },
  // { code: '+61', country: 'AU', flag: '🇦🇺' },
  // { code: '+27', country: 'ZA', flag: '🇿🇦' },
  // { code: '+55', country: 'BR', flag: '🇧🇷' },
  // { code: '+52', country: 'MX', flag: '🇲🇽' },
  // { code: '+971', country: 'AE', flag: '🇦🇪' },
  // { code: '+966', country: 'SA', flag: '🇸🇦' },
  // { code: '+65', country: 'SG', flag: '🇸🇬' },
  // { code: '+60', country: 'MY', flag: '🇲🇾' },
  // { code: '+62', country: 'ID', flag: '🇮🇩' },
  // { code: '+84', country: 'VN', flag: '🇻🇳' },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  countryCode: string
  onCountryCodeChange: (code: string) => void
  placeholder?: string
  required?: boolean
}

export function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  placeholder = '(555) 000-0000',
  required = false,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

  const formatPhoneNumber = (phone: string, code: string): string => {
    if (!phone) return ''
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    
    // Format based on country code
    if (code === '+1') {
      // US/CA format: (XXX) XXX-XXXX
      if (digits.length <= 3) {
        return digits
      } else if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      } else {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
      }
    } else if (code === '+234') {
      // Nigeria format: XXX XXX XXXX or XXX-XXX-XXXX
      if (digits.length <= 3) {
        return digits
      } else if (digits.length <= 6) {
        return `${digits.slice(0, 3)} ${digits.slice(3)}`
      } else {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
      }
    } else if (code === '+44') {
      // UK format: XXXX XXXXXX
      if (digits.length <= 4) {
        return digits
      } else {
        return `${digits.slice(0, 4)} ${digits.slice(4, 10)}`
      }
    }
    
    // Default: just return digits
    return digits
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let phoneValue = e.target.value
    // Remove all non-digit characters to get the raw number
    const digits = phoneValue.replace(/\D/g, '')
    
    // Limit to 15 digits
    const limitedDigits = digits.slice(0, 15)
    
    // Update with raw digits (parent component stores raw digits)
    onChange(limitedDigits)
  }

  const formatPhoneDisplay = (phone: string) => {
    return formatPhoneNumber(phone, countryCode)
  }

  const fullPhoneNumber = countryCode + value

  return (
    <div className="space-y-2">
      <label htmlFor="phone" className="block text-sm font-medium">
        Phone Number
      </label>
      <div 
        className={`flex border rounded-md transition-colors ${
          isFocused || isOpen
            ? 'border-[#0F5132] ring-2 ring-[#0F5132]'
            : 'border-gray-300'
        }`}
      >
        {/* Country Code Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Delay to allow focus to move to input if needed
              setTimeout(() => {
                if (!document.activeElement?.closest('.phone-input-container')) {
                  setIsFocused(false)
                }
              }, 100)
            }}
            className="flex items-center gap-2 px-3 py-2 border-r border-gray-300 rounded-l-md rounded-r-none bg-white hover:bg-gray-50 min-w-[100px] focus:outline-none"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">{selectedCountry.code}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg z-20 max-h-60 overflow-y-auto min-w-[200px]">
                {COUNTRY_CODES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onCountryCodeChange(country.code)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left ${
                      country.code === countryCode ? 'bg-primary/10' : ''
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-sm">{country.country}</span>
                    <span className="text-sm font-medium">{country.code}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          id="phone"
          type="tel"
          value={formatPhoneDisplay(value)}
          onChange={handlePhoneChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={countryCode === '+1' ? '(555) 000-0000' : countryCode === '+234' ? '701 234 5678' : '1234 567890'}
          required={required}
          className="phone-input-container flex-1 px-3 py-2 rounded-r-md rounded-l-none bg-white focus:outline-none"
        />
      </div>
      <input type="hidden" name="fullPhone" value={fullPhoneNumber} />
      <p className="text-xs text-muted-foreground">
        We'll send a verification code to {fullPhoneNumber || 'your number'}
      </p>
    </div>
  )
}

