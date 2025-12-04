/**
 * Symptom data model
 * Represents symptom check logs and analysis
 */

export interface SymptomLog {
  symptomId: string
  userId: string
  symptoms: string[]
  analysis: string
  recommendations: string[]
  urgency: 'low' | 'medium' | 'high'
  createdAt: string
}

