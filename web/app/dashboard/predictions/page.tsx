'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'

export default function PredictionsPage() {
  const { data: current, isLoading } = useQuery({
    queryKey: ['predictions', 'current'],
    queryFn: () => api.predictions.getCurrent(),
  })

  const { data: history = [] } = useQuery({
    queryKey: ['predictions', 'history'],
    queryFn: () => api.predictions.getHistory(),
  })

  if (isLoading) {
    return <div>Loading predictions...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Health Predictions</h1>
        <p className="text-muted-foreground mt-2">AI-powered health risk scoring and recommendations</p>
      </div>

      {current && (
        <Card>
          <CardHeader>
            <CardTitle>Current Risk Score</CardTitle>
            <CardDescription>Based on your lifestyle and health data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl font-bold text-center">
              {current.riskScore}
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Key Factors:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {current.factors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Recommendations:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {current.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((prediction) => (
                <div key={prediction.id} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Risk Score: {prediction.riskScore}/100</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

