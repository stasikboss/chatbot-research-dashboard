import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType, ResponseTime, CommStyle, AgeGroup } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'

/**
 * GET /api/admin/conditions/[id]
 * Fetch a single condition by ID with detailed statistics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const conditionId = parseInt(params.id)
    if (isNaN(conditionId)) {
      return NextResponse.json({ error: 'Invalid condition ID' }, { status: 400 })
    }

    const condition = await prisma.condition.findUnique({
      where: { id: conditionId },
      include: {
        participants: {
          include: {
            result: true,
          },
        },
      },
    })

    if (!condition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
    }

    // Calculate detailed statistics
    const completedParticipants = condition.participants.filter(
      (p) => p.status === 'COMPLETED'
    )

    const stats = {
      totalParticipants: condition.participants.length,
      completedCount: completedParticipants.length,
      inProgressCount: condition.participants.filter((p) => p.status === 'IN_PROGRESS')
        .length,
      abandonedCount: condition.participants.filter((p) => p.status === 'ABANDONED').length,
      completionRate:
        condition.participants.length > 0
          ? (completedParticipants.length / condition.participants.length) * 100
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
          ? (completedParticipants.filter((p) => p.result?.participatedNegotiation).length /
              completedParticipants.length) *
            100
          : 0,
    }

    return NextResponse.json({
      condition: {
        id: condition.id,
        responseTime: condition.responseTime,
        communicationStyle: condition.communicationStyle,
        ageGroup: condition.ageGroup,
        participantCount: condition.participantCount,
        stats,
      },
    })
  } catch (error: any) {
    console.error('[API] Error fetching condition:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch condition' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * PATCH /api/admin/conditions/[id]
 * Update a condition
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const conditionId = parseInt(params.id)

    if (isNaN(conditionId)) {
      return NextResponse.json({ error: 'Invalid condition ID' }, { status: 400 })
    }

    const body = await req.json()
    const { responseTime, communicationStyle, ageGroup } = body

    // Check if condition exists
    const existingCondition = await prisma.condition.findUnique({
      where: { id: conditionId },
      include: {
        participants: true,
      },
    })

    if (!existingCondition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
    }

    // Warn if participants are assigned
    if (existingCondition.participants.length > 0) {
      console.warn(
        `[API] Warning: Updating condition ${conditionId} which has ${existingCondition.participants.length} assigned participants`
      )
    }

    // Validate enum values if provided
    if (responseTime && !Object.values(ResponseTime).includes(responseTime)) {
      return NextResponse.json(
        { error: `Invalid responseTime value: ${responseTime}` },
        { status: 400 }
      )
    }

    if (
      communicationStyle &&
      !Object.values(CommStyle).includes(communicationStyle)
    ) {
      return NextResponse.json(
        { error: `Invalid communicationStyle value: ${communicationStyle}` },
        { status: 400 }
      )
    }

    if (ageGroup && !Object.values(AgeGroup).includes(ageGroup)) {
      return NextResponse.json(
        { error: `Invalid ageGroup value: ${ageGroup}` },
        { status: 400 }
      )
    }

    // Check for duplicate combination if changing parameters
    if (responseTime || communicationStyle || ageGroup) {
      const newResponseTime = responseTime || existingCondition.responseTime
      const newCommStyle = communicationStyle || existingCondition.communicationStyle
      const newAgeGroup = ageGroup || existingCondition.ageGroup

      // Only check if the combination is actually different
      const isDifferent =
        newResponseTime !== existingCondition.responseTime ||
        newCommStyle !== existingCondition.communicationStyle ||
        newAgeGroup !== existingCondition.ageGroup

      if (isDifferent) {
        const duplicate = await prisma.condition.findUnique({
          where: {
            responseTime_communicationStyle_ageGroup: {
              responseTime: newResponseTime as ResponseTime,
              communicationStyle: newCommStyle as CommStyle,
              ageGroup: newAgeGroup as AgeGroup,
            },
          },
        })

        if (duplicate && duplicate.id !== conditionId) {
          return NextResponse.json(
            {
              error: `Condition with this combination already exists (ID: ${duplicate.id})`,
              existingId: duplicate.id,
            },
            { status: 409 }
          )
        }
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (responseTime) updateData.responseTime = responseTime as ResponseTime
    if (communicationStyle)
      updateData.communicationStyle = communicationStyle as CommStyle
    if (ageGroup) updateData.ageGroup = ageGroup as AgeGroup

    // Update condition
    const updatedCondition = await prisma.condition.update({
      where: { id: conditionId },
      data: updateData,
    })

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.UPDATE_CONDITION,
      description: `עדכן תנאי ${conditionId}`,
      metadata: {
        conditionId,
        changes: body,
        participantsAffected: existingCondition.participants.length,
      },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({
      condition: updatedCondition,
      warning:
        existingCondition.participants.length > 0
          ? `Warning: ${existingCondition.participants.length} participants are assigned to this condition`
          : undefined,
    })
  } catch (error: any) {
    console.error('[API] Error updating condition:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update condition' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * DELETE /api/admin/conditions/[id]
 * Delete a condition (only if no participants assigned)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const conditionId = parseInt(params.id)

    if (isNaN(conditionId)) {
      return NextResponse.json({ error: 'Invalid condition ID' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const force = searchParams.get('force') === 'true'

    // Check if condition exists
    const condition = await prisma.condition.findUnique({
      where: { id: conditionId },
      include: {
        participants: true,
      },
    })

    if (!condition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
    }

    // Safety check: prevent deletion if participants exist
    if (condition.participantCount > 0 || condition.participants.length > 0) {
      if (!force) {
        return NextResponse.json(
          {
            error: `Cannot delete condition: ${condition.participants.length} participants are assigned`,
            participantCount: condition.participants.length,
            suggestion:
              'Use force=true query parameter to force delete (will cascade delete participants)',
          },
          { status: 409 }
        )
      }
    }

    // Delete condition (cascade will delete participants if force=true)
    const deletedCondition = await prisma.condition.delete({
      where: { id: conditionId },
    })

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.DELETE_CONDITION,
      description: `מחק תנאי ${conditionId}: ${condition.responseTime} + ${condition.communicationStyle} + ${condition.ageGroup}`,
      metadata: {
        conditionId,
        responseTime: condition.responseTime,
        communicationStyle: condition.communicationStyle,
        ageGroup: condition.ageGroup,
        participantsDeleted: condition.participants.length,
        forceDelete: force,
      },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Condition deleted successfully',
      deletedCondition,
      participantsDeleted: condition.participants.length,
    })
  } catch (error: any) {
    console.error('[API] Error deleting condition:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete condition' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
