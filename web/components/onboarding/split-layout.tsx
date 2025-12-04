'use client'

import { ReactNode } from 'react'

interface SplitLayoutProps {
  children: ReactNode
  testimonial?: {
    quote: string
    name: string
    role: string
  }
}

export function SplitLayout({ children, testimonial }: SplitLayoutProps) {
  const defaultTestimonial = {
    quote: "MyOra helps me understand my health better than ever. The insights are clear, personalised, and genuinely life-changing.",
    name: "kayode Makinde",
    role: "Lawyer"
  }

  const testimonialData = testimonial || defaultTestimonial

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Form */}
        <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">
          {children}
        </div>

        {/* Right Side - Image with Testimonial */}
        <div className="flex-1 bg-[#0F5132] relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&h=1200&fit=crop")',
            }}
          >
            <div className="absolute inset-0 bg-[#0F5132]/80"></div>
          </div>

          {/* Testimonial Overlay */}
          <div className="absolute bottom-8 right-8 left-8 md:left-auto md:w-80">
            <div className="bg-[#1a7a4a] rounded-2xl p-6 shadow-xl">
              {/* Chat Icon */}
              <div className="flex justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* Quote */}
              <p className="text-white text-sm leading-relaxed mb-4">
                "{testimonialData.quote}"
              </p>
              
              {/* Author */}
              <div className="border-t border-white/20 pt-3">
                <p className="text-white font-semibold text-sm">{testimonialData.name}</p>
                <p className="text-white/80 text-xs">{testimonialData.role}</p>
              </div>
              
              {/* Pagination Dots */}
              <div className="flex gap-2 justify-center mt-4">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

