import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { ActivityType } from '@prisma/client'

/**
 * GET /api/admin/activity
 * Get activity logs with filters and pagination
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const researcherId = searchParams.get('researcherId')
    const action = searchParams.get('action')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}

    if (researcherId) {
      where.researcherId = researcherId
    }

    if (action && Object.values(ActivityType).includes(action as ActivityType)) {
      where.action = action as ActivityType
    }

    if (fromDate || toDate) {
      where.timestamp = {}
      if (fromDate) {
        where.timestamp.gte = new Date(fromDate)
      }
      if (toDate) {
        where.timestamp.lte = new Date(toDate)
      }
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          researcher: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({ where }),
    ])

    return NextResponse.json({
      activities,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('GET /api/admin/activity error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity logs' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
