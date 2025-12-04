'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

export function LifeScoreCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['lifescore', 'current'],
    queryFn: () => api.lifescore.getCurrent(),
  })

  if (isLoading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>
  }

  if (!data) {
    return <Card><CardContent className="p-6">No LifeScore data available</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your LifeScore</CardTitle>
        <CardDescription>Overall health score based on Move, Fuel, and Recharge</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">{data.overall}</div>
            <div className="text-sm text-muted-foreground">Overall</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{data.move}</div>
            <div className="text-sm text-muted-foreground">Move</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{data.fuel}</div>
            <div className="text-sm text-muted-foreground">Fuel</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{data.recharge}</div>
            <div className="text-sm text-muted-foreground">Recharge</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

