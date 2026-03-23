import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'

/**
 * POST /api/admin/conditions/[id]/reset-count
 * Reset the participant count for a condition to 0
 * WARNING: This affects load balancing and should only be used for testing/maintenance
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const conditionId = parseInt(params.id)

    if (isNaN(conditionId)) {
      return NextResponse.json({ error: 'Invalid condition ID' }, { status: 400 })
    }

    // Check if condition exists
    const condition = await prisma.condition.findUnique({
      where: { id: conditionId },
    })

    if (!condition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
    }

    const oldCount = condition.participantCount

    // Reset participant count
    const updatedCondition = await prisma.condition.update({
      where: { id: conditionId },
      data: { participantCount: 0 },
    })

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.RESET_CONDITION_COUNTS,
      description: `איפס מונה משתתפים לתנאי ${conditionId} (מ-${oldCount} ל-0)`,
      metadata: {
        conditionId,
        oldCount,
        newCount: 0,
        responseTime: condition.responseTime,
        communicationStyle: condition.communicationStyle,
        ageGroup: condition.ageGroup,
      },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({
      success: true,
      message: `Participant count reset from ${oldCount} to 0`,
      condition: updatedCondition,
      oldCount,
      newCount: 0,
    })
  } catch (error: any) {
    console.error('[API] Error resetting condition count:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset condition count' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
