/**
 * Onboarding service
 * Handles coach settings and profile completion
 */

import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'

export interface CoachSettings {
  coachName: string
  avatar: string
}

export interface ProfileData {
  age?: number
  gender?: string
  height?: number
  weight?: number
  healthGoals?: string
  medicalConditions?: string
  passwordHash?: string
  onboardingCompleted?: boolean
}

/**
 * Save coach personalization settings
 */
export async function saveCoachSettings(
  userId: string,
  settings: CoachSettings
): Promise<void> {
  await dynamoClient.send(
    new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { userId },
      UpdateExpression: 'SET coachName = :coachName, coachAvatar = :avatar, updatedAt = :now',
      ExpressionAttributeValues: {
        ':coachName': settings.coachName,
        ':avatar': settings.avatar,
        ':now': new Date().toISOString(),
      },
    })
  )
}

/**
 * Complete user profile
 */
export async function completeProfile(
  userId: string,
  profileData: ProfileData
): Promise<void> {
  const updateExpressions: string[] = []
  const expressionValues: Record<string, any> = {
    ':now': new Date().toISOString(),
  }

  if (profileData.age !== undefined) {
    updateExpressions.push('age = :age')
    expressionValues[':age'] = profileData.age
  }

  if (profileData.gender) {
    updateExpressions.push('gender = :gender')
    expressionValues[':gender'] = profileData.gender
  }

  if (profileData.height !== undefined) {
    updateExpressions.push('height = :height')
    expressionValues[':height'] = profileData.height
  }

  if (profileData.weight !== undefined) {
    updateExpressions.push('weight = :weight')
    expressionValues[':weight'] = profileData.weight
  }

  if (profileData.healthGoals) {
    updateExpressions.push('healthGoals = :healthGoals')
    expressionValues[':healthGoals'] = profileData.healthGoals
  }

  if (profileData.medicalConditions) {
    updateExpressions.push('medicalConditions = :medicalConditions')
    expressionValues[':medicalConditions'] = profileData.medicalConditions
  }

  if (profileData.passwordHash) {
    updateExpressions.push('passwordHash = :passwordHash')
    expressionValues[':passwordHash'] = profileData.passwordHash
  }

  if (profileData.onboardingCompleted !== undefined) {
    updateExpressions.push('onboardingCompleted = :onboardingCompleted')
    expressionValues[':onboardingCompleted'] = profileData.onboardingCompleted
  }

  updateExpressions.push('updatedAt = :now')

  await dynamoClient.send(
    new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeValues: expressionValues,
    })
  )
}

