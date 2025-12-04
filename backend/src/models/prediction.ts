/**
 * Prediction data model
 * Represents health risk predictions and scores
 */

export interface Prediction {
  predictionId: string
  userId: string
  riskScore: number // 0-100
  factors: string[]
  recommendations: string[]
  createdAt: string
}

