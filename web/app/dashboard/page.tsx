import { LifeScoreCard } from '@/components/dashboard/lifescore-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your health overview.</p>
      </div>

      <LifeScoreCard />
      <QuickActions />
      <RecentActivity />
    </div>
  )
}

