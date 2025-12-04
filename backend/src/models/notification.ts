/**
 * Notification data model
 * Represents user notifications and reminders
 */

export interface Notification {
  notificationId: string
  userId: string
  type: 'reminder' | 'alert' | 'info' | 'prediction'
  title: string
  message: string
  read: boolean
  createdAt: string
}

