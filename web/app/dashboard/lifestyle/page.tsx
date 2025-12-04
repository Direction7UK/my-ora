'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export default function LifestylePage() {
  const [activeTab, setActiveTab] = useState<'meal' | 'activity' | 'sleep' | 'stress'>('meal')
  const [mealImage, setMealImage] = useState<File | null>(null)
  const [mealNotes, setMealNotes] = useState('')

  const mealMutation = useMutation({
    mutationFn: ({ image, notes }: { image: File; notes?: string }) =>
      api.lifestyle.logMeal(image, notes),
  })

  const handleMealSubmit = () => {
    if (mealImage) {
      mealMutation.mutate({ image: mealImage, notes: mealNotes || undefined })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lifestyle Logging</h1>
        <p className="text-muted-foreground mt-2">Track your meals, activities, sleep, and stress</p>
      </div>

      <div className="flex gap-2 border-b">
        {(['meal', 'activity', 'sleep', 'stress'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${
              activeTab === tab
                ? 'border-b-2 border-primary font-semibold'
                : 'text-muted-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'meal' && (
        <Card>
          <CardHeader>
            <CardTitle>Log Meal</CardTitle>
            <CardDescription>Upload a photo of your meal for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Meal Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMealImage(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (optional)</label>
              <textarea
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                placeholder="Add any notes about this meal..."
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>
            <Button
              onClick={handleMealSubmit}
              disabled={!mealImage || mealMutation.isPending}
            >
              {mealMutation.isPending ? 'Analyzing...' : 'Log Meal'}
            </Button>
            {mealMutation.data && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <h3 className="font-semibold mb-2">Nutrition Analysis:</h3>
                <pre className="text-sm">{JSON.stringify(mealMutation.data.nutrition, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader>
            <CardTitle>Log Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Activity logging form coming soon...</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'sleep' && (
        <Card>
          <CardHeader>
            <CardTitle>Log Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Sleep logging form coming soon...</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'stress' && (
        <Card>
          <CardHeader>
            <CardTitle>Log Stress Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Stress logging form coming soon...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

