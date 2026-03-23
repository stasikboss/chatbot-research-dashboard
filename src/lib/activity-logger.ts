import { prisma } from './prisma'
import { ActivityType } from '@prisma/client'

export interface LogActivityParams {
  researcherId: string
  action: ActivityType
  description: string
  metadata?: Record<string, any>
  ipAddress?: string
}

/**
 * Log researcher activity to the database
 */
export async function logActivity({
  researcherId,
  action,
  description,
  metadata,
  ipAddress,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        researcherId,
        action,
        description,
        metadata: metadata || null,
        ipAddress: ipAddress || null,
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw - logging should not break the main flow
  }
}

/**
 * Log multiple activities at once
 */
export async function logActivities(activities: LogActivityParams[]): Promise<void> {
  try {
    await prisma.activityLog.createMany({
      data: activities.map((activity) => ({
        researcherId: activity.researcherId,
        action: activity.action,
        description: activity.description,
        metadata: activity.metadata || null,
        ipAddress: activity.ipAddress || null,
      })),
    })
  } catch (error) {
    console.error('Failed to log activities:', error)
  }
}
