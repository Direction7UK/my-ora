'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/chat', label: 'Chat' },
  { href: '/dashboard/symptoms', label: 'Symptom Checker' },
  { href: '/dashboard/lifescore', label: 'LifeScore' },
  { href: '/dashboard/lifestyle', label: 'Lifestyle' },
  { href: '/dashboard/predictions', label: 'Predictions' },
  { href: '/dashboard/notifications', label: 'Notifications' },
  { href: '/dashboard/profile', label: 'Profile' },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold">
              MyOra
            </Link>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    pathname === item.href
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Button variant="ghost" onClick={async () => {
            const { signOutUser } = await import('@/lib/auth-nextauth')
            try {
              await signOutUser()
            } catch (error) {
              console.error('Logout error:', error)
              window.location.href = '/auth/login'
            }
          }}>
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}

