import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Role, Status } from '@prisma/client'

/**
 * GET /api/admin/stats
 * Get combined statistics for dashboard overview
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const [
      totalResearchers,
      adminCount,
      researcherCount,
      activeResearchers,
      totalParticipants,
      completedParticipants,
      inProgressParticipants,
      abandonedParticipants,
      todayLogins,
    ] = await Promise.all([
      // Researcher stats
      prisma.researcher.count(),
      prisma.researcher.count({ where: { role: Role.ADMIN } }),
      prisma.researcher.count({ where: { role: Role.RESEARCHER } }),
      prisma.researcher.count({ where: { isActive: true } }),

      // Participant stats
      prisma.participant.count(),
      prisma.participant.count({ where: { status: Status.COMPLETED } }),
      prisma.participant.count({ where: { status: Status.IN_PROGRESS } }),
      prisma.participant.count({ where: { status: Status.ABANDONED } }),

      // Login stats (today)
      prisma.loginSession.count({
        where: {
          loginTime: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate()
            ),
          },
        },
      }),
    ])

    // Get active researchers today (unique)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const activeToday = await prisma.loginSession.findMany({
      where: {
        loginTime: { gte: today },
      },
      select: {
        researcherId: true,
      },
      distinct: ['researcherId'],
    })

    return NextResponse.json({
      researchers: {
        total: totalResearchers,
        admins: adminCount,
        researchers: researcherCount,
        active: activeResearchers,
        activeToday: activeToday.length,
      },
      participants: {
        total: totalParticipants,
        completed: completedParticipants,
        inProgress: inProgressParticipants,
        abandoned: abandonedParticipants,
      },
      activity: {
        loginsToday: todayLogins,
      },
    })
  } catch (error: any) {
    console.error('GET /api/admin/stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
