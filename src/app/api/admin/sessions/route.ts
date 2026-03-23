import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/sessions
 * Get all login sessions with filters
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const researcherId = searchParams.get('researcherId')
    const isActive = searchParams.get('isActive')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}

    if (researcherId) {
      where.researcherId = researcherId
    }

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    if (fromDate || toDate) {
      where.loginTime = {}
      if (fromDate) {
        where.loginTime.gte = new Date(fromDate)
      }
      if (toDate) {
        where.loginTime.lte = new Date(toDate)
      }
    }

    const [sessions, total] = await Promise.all([
      prisma.loginSession.findMany({
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
          loginTime: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.loginSession.count({ where }),
    ])

    // Calculate duration for each session
    const sessionsWithDuration = sessions.map((session) => {
      let durationSeconds = null
      if (session.logoutTime) {
        durationSeconds = Math.floor(
          (session.logoutTime.getTime() - session.loginTime.getTime()) / 1000
        )
      }

      return {
        ...session,
        durationSeconds,
      }
    })

    return NextResponse.json({
      sessions: sessionsWithDuration,
      total,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('GET /api/admin/sessions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
