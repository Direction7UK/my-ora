/**
 * Lifestyle logging data models
 * Represents meals, activities, sleep, and stress logs
 */

export interface MealLog {
  logId: string
  userId: string
  type: 'meal'
  imageUrl?: string
  s3Key?: string
  nutrition?: {
    calories?: number
    protein?: number
    carbs?: number
    fats?: number
    vitamins?: Record<string, number>
  }
  notes?: string
  createdAt: string
}

export interface ActivityLog {
  logId: string
  userId: string
  type: 'activity'
  activityType: string
  duration: number // minutes
  intensity: 'low' | 'medium' | 'high'
  caloriesBurned?: number
  notes?: string
  createdAt: string
}

export interface SleepLog {
  logId: string
  userId: string
  type: 'sleep'
  hours: number
  quality: 'poor' | 'fair' | 'good' | 'excellent'
  notes?: string
  createdAt: string
}

export interface StressLog {
  logId: string
  userId: string
  type: 'stress'
  level: number // 1-10
  notes?: string
  createdAt: string
}

export type LifestyleLog = MealLog | ActivityLog | SleepLog | StressLog

