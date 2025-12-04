'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/chat">
            <Button variant="outline" className="w-full h-20 flex flex-col">
              <span className="text-lg">💬</span>
              <span>Chat</span>
            </Button>
          </Link>
          <Link href="/dashboard/symptoms">
            <Button variant="outline" className="w-full h-20 flex flex-col">
              <span className="text-lg">🏥</span>
              <span>Check Symptoms</span>
            </Button>
          </Link>
          <Link href="/dashboard/lifestyle">
            <Button variant="outline" className="w-full h-20 flex flex-col">
              <span className="text-lg">📝</span>
              <span>Log Activity</span>
            </Button>
          </Link>
          <Link href="/dashboard/predictions">
            <Button variant="outline" className="w-full h-20 flex flex-col">
              <span className="text-lg">📊</span>
              <span>View Predictions</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

