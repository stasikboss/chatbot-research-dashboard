import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/conditions/stats
 * Get aggregated statistics across all conditions
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    // Fetch all conditions with participants and results
    const conditions = await prisma.condition.findMany({
      include: {
        participants: {
          include: {
            result: true,
          },
        },
      },
    })

    // Aggregate statistics
    const allParticipants = conditions.flatMap((c) => c.participants)
    const completedParticipants = allParticipants.filter(
      (p) => p.status === 'COMPLETED'
    )

    const stats = {
      totalConditions: conditions.length,
      totalParticipants: allParticipants.length,
      completedCount: completedParticipants.length,
      inProgressCount: allParticipants.filter((p) => p.status === 'IN_PROGRESS').length,
      abandonedCount: allParticipants.filter((p) => p.status === 'ABANDONED').length,
      overallCompletionRate:
        allParticipants.length > 0
          ? (completedParticipants.length / allParticipants.length) * 100
          : 0,
      averageDuration:
        completedParticipants.length > 0
          ? completedParticipants.reduce(
              (sum, p) => sum + (p.result?.totalDurationSeconds || 0),
              0
            ) / completedParticipants.length
          : 0,
      averageSatisfaction:
        completedParticipants.length > 0
          ? completedParticipants.reduce(
              (sum, p) => sum + (p.result?.satisfactionScore || 0),
              0
            ) / completedParticipants.length
          : 0,
      negotiationParticipationRate:
        completedParticipants.length > 0
          ? (completedParticipants.filter((p) => p.result?.participatedNegotiation)
              .length /
              completedParticipants.length) *
            100
          : 0,
      offerAcceptanceRate:
        completedParticipants.filter((p) => p.result?.participatedNegotiation).length >
        0
          ? (completedParticipants.filter(
              (p) =>
                p.result?.participatedNegotiation && p.result?.acceptedCounterOffer
            ).length /
              completedParticipants.filter((p) => p.result?.participatedNegotiation)
                .length) *
            100
          : 0,
    }

    // Statistics by response time
    const byResponseTime = {
      IMMEDIATE: {
        participants: allParticipants.filter(
          (p) => p.condition.responseTime === 'IMMEDIATE'
        ).length,
        completed: completedParticipants.filter(
          (p) => p.condition.responseTime === 'IMMEDIATE'
        ).length,
      },
      DELAY_WITH_MESSAGE: {
        participants: allParticipants.filter(
          (p) => p.condition.responseTime === 'DELAY_WITH_MESSAGE'
        ).length,
        completed: completedParticipants.filter(
          (p) => p.condition.responseTime === 'DELAY_WITH_MESSAGE'
        ).length,
      },
      DELAY_NO_MESSAGE: {
        participants: allParticipants.filter(
          (p) => p.condition.responseTime === 'DELAY_NO_MESSAGE'
        ).length,
        completed: completedParticipants.filter(
          (p) => p.condition.responseTime === 'DELAY_NO_MESSAGE'
        ).length,
      },
    }

    // Statistics by communication style
    const byCommStyle = {
      FORMAL: {
        participants: allParticipants.filter(
          (p) => p.condition.communicationStyle === 'FORMAL'
        ).length,
        completed: completedParticipants.filter(
          (p) => p.condition.communicationStyle === 'FORMAL'
        ).length,
        averageSatisfaction:
          completedParticipants.filter(
            (p) => p.condition.communicationStyle === 'FORMAL'
          ).length > 0
            ? completedParticipants
                .filter((p) => p.condition.communicationStyle === 'FORMAL')
                .reduce((sum, p) => sum + (p.result?.satisfactionScore || 0), 0) /
              completedParticipants.filter(
                (p) => p.condition.communicationStyle === 'FORMAL'
              ).length
            : 0,
      },
      FRIENDLY: {
        participants: allParticipants.filter(
          (p) => p.condition.communicationStyle === 'FRIENDLY'
        ).length,
        completed: completedParticipants.filter(
          (p) => p.condition.communicationStyle === 'FRIENDLY'
        ).length,
        averageSatisfaction:
          completedParticipants.filter(
            (p) => p.condition.communicationStyle === 'FRIENDLY'
          ).length > 0
            ? completedParticipants
                .filter((p) => p.condition.communicationStyle === 'FRIENDLY')
                .reduce((sum, p) => sum + (p.result?.satisfactionScore || 0), 0) /
              completedParticipants.filter(
                (p) => p.condition.communicationStyle === 'FRIENDLY'
              ).length
            : 0,
      },
    }

    // Statistics by age group
    const byAgeGroup = {
      YOUNG: {
        participants: allParticipants.filter((p) => p.condition.ageGroup === 'YOUNG')
          .length,
        completed: completedParticipants.filter(
          (p) => p.condition.ageGroup === 'YOUNG'
        ).length,
      },
      OLD: {
        participants: allParticipants.filter((p) => p.condition.ageGroup === 'OLD')
          .length,
        completed: completedParticipants.filter((p) => p.condition.ageGroup === 'OLD')
          .length,
      },
    }

    return NextResponse.json({
      stats,
      byResponseTime,
      byCommStyle,
      byAgeGroup,
    })
  } catch (error: any) {
    console.error('[API] Error fetching condition statistics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
