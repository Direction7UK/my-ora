/**
 * Notification service
 * Manages user notifications and reminders
 */

import { dynamoClient, TABLES } from '../../../src/utils/dynamodb'
import { PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'

export interface Notification {
  notificationId: string
  userId: string
  type: 'reminder' | 'alert' | 'info' | 'prediction'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string
) {
  const notificationId = uuidv4()

  await dynamoClient.send(
    new PutCommand({
      TableName: TABLES.ADMIN, // Using admin table for notifications (or create separate table)
      Item: {
        notificationId,
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      },
    })
  )

  return notificationId
}

export async function getNotifications(userId: string) {
  // Since ADMIN table doesn't have userId as partition key, we use Scan with filter
  // In production, create a separate notifications table with userId as partition key
  const result = await dynamoClient.send(
    new ScanCommand({
      TableName: TABLES.ADMIN,
      FilterExpression: 'userId = :userId AND attribute_exists(notificationId)',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
  )

  return (result.Items || [])
    .filter((item) => item.notificationId) // Only notification items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((item) => ({
      id: item.notificationId,
      type: item.type,
      title: item.title,
      message: item.message,
      read: item.read || false,
      createdAt: item.createdAt,
    }))
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await dynamoClient.send(
    new UpdateCommand({
      TableName: TABLES.ADMIN,
      Key: {
        notificationId,
      },
      UpdateExpression: 'SET #read = :read',
      ConditionExpression: 'userId = :userId',
      ExpressionAttributeNames: {
        '#read': 'read',
      },
      ExpressionAttributeValues: {
        ':read': true,
        ':userId': userId,
      },
    })
  )
}

export async function markAllNotificationsRead(userId: string) {
  // Get all unread notifications
  const notifications = await getNotifications(userId)
  const unreadNotifications = notifications.filter((n) => !n.read)

  // Mark each as read
  await Promise.all(
    unreadNotifications.map((notification) =>
      markNotificationRead(userId, notification.id)
    )
  )
}

