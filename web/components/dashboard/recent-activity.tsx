'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils'

export function RecentActivity() {
  // TODO: Fetch real activity data
  const activities = [
    { type: 'Meal logged', time: new Date(), details: 'Breakfast' },
    { type: 'Sleep logged', time: new Date(Date.now() - 3600000), details: '8 hours' },
    { type: 'Activity logged', time: new Date(Date.now() - 7200000), details: '30 min walk' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest health logs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2">
              <div>
                <div className="font-medium">{activity.type}</div>
                <div className="text-sm text-muted-foreground">{activity.details}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDateTime(activity.time)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

