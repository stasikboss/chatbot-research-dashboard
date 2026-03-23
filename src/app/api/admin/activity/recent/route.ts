import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - do not statically generate this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/activity/recent
 * Get recent activity logs (last 20)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const activities = await prisma.activityLog.findMany({
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
      take: 20,
    })

    return NextResponse.json({ activities })
  } catch (error: any) {
    console.error('GET /api/admin/activity/recent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recent activities' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
