import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/sessions/stats
 * Get session statistics
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalSessions,
      activeSessions,
      todaySessions,
      weekSessions,
      monthSessions,
      avgSessionDuration,
    ] = await Promise.all([
      // Total sessions
      prisma.loginSession.count(),

      // Active sessions
      prisma.loginSession.count({
        where: { isActive: true },
      }),

      // Today's sessions
      prisma.loginSession.count({
        where: {
          loginTime: { gte: today },
        },
      }),

      // This week's sessions
      prisma.loginSession.count({
        where: {
          loginTime: { gte: thisWeek },
        },
      }),

      // This month's sessions
      prisma.loginSession.count({
        where: {
          loginTime: { gte: thisMonth },
        },
      }),

      // Average session duration (completed sessions only)
      prisma.loginSession.findMany({
        where: {
          logoutTime: { not: null },
        },
        select: {
          loginTime: true,
          logoutTime: true,
        },
      }),
    ])

    // Calculate average duration
    let averageDurationSeconds = 0
    if (avgSessionDuration.length > 0) {
      const totalDuration = avgSessionDuration.reduce((sum, session) => {
        if (session.logoutTime) {
          const duration =
            (session.logoutTime.getTime() - session.loginTime.getTime()) / 1000
          return sum + duration
        }
        return sum
      }, 0)
      averageDurationSeconds = Math.floor(
        totalDuration / avgSessionDuration.length
      )
    }

    // Get unique researchers who logged in today
    const todayResearchers = await prisma.loginSession.findMany({
      where: {
        loginTime: { gte: today },
      },
      select: {
        researcherId: true,
      },
      distinct: ['researcherId'],
    })

    return NextResponse.json({
      totalSessions,
      activeSessions,
      todaySessions,
      weekSessions,
      monthSessions,
      averageDurationSeconds,
      activeResearchersToday: todayResearchers.length,
    })
  } catch (error: any) {
    console.error('GET /api/admin/sessions/stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session stats' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
