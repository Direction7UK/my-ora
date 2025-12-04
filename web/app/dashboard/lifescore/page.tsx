'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function LifeScorePage() {
  const { data: current } = useQuery({
    queryKey: ['lifescore', 'current'],
    queryFn: () => api.lifescore.getCurrent(),
  })

  const { data: history = [] } = useQuery({
    queryKey: ['lifescore', 'history'],
    queryFn: () => api.lifescore.getHistory(30),
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">LifeScore Dashboard</h1>
        <p className="text-muted-foreground mt-2">Track your Move, Fuel, and Recharge scores over time</p>
      </div>

      {current && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Overall</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{current.overall}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Move</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{current.move}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Fuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{current.fuel}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Recharge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{current.recharge}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>30-Day History</CardTitle>
            <CardDescription>LifeScore trends over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="overall" stroke="#8884d8" name="Overall" />
                <Line type="monotone" dataKey="move" stroke="#82ca9d" name="Move" />
                <Line type="monotone" dataKey="fuel" stroke="#ffc658" name="Fuel" />
                <Line type="monotone" dataKey="recharge" stroke="#ff7300" name="Recharge" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

