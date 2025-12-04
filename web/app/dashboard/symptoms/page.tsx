'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState('')
  const [symptomList, setSymptomList] = useState<string[]>([])

  const checkMutation = useMutation({
    mutationFn: (symptoms: string[]) => api.symptoms.check(symptoms),
  })

  const handleAddSymptom = () => {
    if (symptoms.trim() && !symptomList.includes(symptoms.trim())) {
      setSymptomList([...symptomList, symptoms.trim()])
      setSymptoms('')
    }
  }

  const handleCheck = () => {
    if (symptomList.length > 0) {
      checkMutation.mutate(symptomList)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Symptom Checker</h1>

      <Card>
        <CardHeader>
          <CardTitle>Enter Your Symptoms</CardTitle>
          <CardDescription>Add symptoms you're experiencing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSymptom()}
              placeholder="e.g., headache, fever, nausea"
              className="flex-1 px-4 py-2 border rounded-md"
            />
            <Button onClick={handleAddSymptom} disabled={!symptoms.trim()}>
              Add
            </Button>
          </div>

          {symptomList.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {symptomList.map((symptom, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary rounded-full text-sm flex items-center gap-2"
                  >
                    {symptom}
                    <button
                      onClick={() => setSymptomList(symptomList.filter((_, i) => i !== index))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Button onClick={handleCheck} disabled={checkMutation.isPending} className="w-full">
                {checkMutation.isPending ? 'Analyzing...' : 'Check Symptoms'}
              </Button>
            </div>
          )}

          {checkMutation.data && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>
                  Analysis Results
                  <span className={`ml-2 text-sm ${
                    checkMutation.data.urgency === 'high' ? 'text-destructive' :
                    checkMutation.data.urgency === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    ({checkMutation.data.urgency} urgency)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Analysis:</h3>
                  <p className="text-sm text-muted-foreground">{checkMutation.data.analysis}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Recommendations:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {checkMutation.data.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

