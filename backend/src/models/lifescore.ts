/**
 * LifeScore data model
 * Represents Move, Fuel, and Recharge scores
 */

export interface LifeScore {
  userId: string
  date: string // YYYY-MM-DD format
  move: number // 0-100
  fuel: number // 0-100
  recharge: number // 0-100
  overall: number // 0-100 (calculated average)
  factors: {
    move: string[]
    fuel: string[]
    recharge: string[]
  }
  createdAt: string
  updatedAt: string
}

