import { NextRequest, NextResponse } from 'next/server'
// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType, ResponseTime, CommStyle, AgeGroup } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'

/**
 * GET /api/admin/conditions
 * Fetch all conditions with statistics
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const responseTime = searchParams.get('responseTime')
    const communicationStyle = searchParams.get('communicationStyle')
    const ageGroup = searchParams.get('ageGroup')

    const where: any = {}

    if (responseTime && Object.values(ResponseTime).includes(responseTime as ResponseTime)) {
      where.responseTime = responseTime as ResponseTime
    }

    if (communicationStyle && Object.values(CommStyle).includes(communicationStyle as CommStyle)) {
      where.communicationStyle = communicationStyle as CommStyle
    }

    if (ageGroup && Object.values(AgeGroup).includes(ageGroup as AgeGroup)) {
      where.ageGroup = ageGroup as AgeGroup
    }

    const conditions = await prisma.condition.findMany({
      where,
      include: {
        participants: {
          include: {
            result: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    })

    // Calculate statistics for each condition
    const conditionsWithStats = conditions.map((condition) => {
      const completedParticipants = condition.participants.filter(
        (p) => p.status === 'COMPLETED'
      )

      const totalDuration =
        completedParticipants.reduce(
          (sum, p) => sum + (p.result?.totalDurationSeconds || 0),
          0
        ) || 0

      const totalSatisfaction =
        completedParticipants.reduce(
          (sum, p) => sum + (p.result?.satisfactionScore || 0),
          0
        ) || 0

      return {
        id: condition.id,
        responseTime: condition.responseTime,
        communicationStyle: condition.communicationStyle,
        ageGroup: condition.ageGroup,
        participantCount: condition.participantCount,
        stats: {
          totalParticipants: condition.participants.length,
          completedCount: completedParticipants.length,
          inProgressCount: condition.participants.filter((p) => p.status === 'IN_PROGRESS')
            .length,
          abandonedCount: condition.participants.filter((p) => p.status === 'ABANDONED')
            .length,
          completionRate:
            condition.participants.length > 0
              ? (completedParticipants.length / condition.participants.length) * 100
              : 0,
          averageDuration:
            completedParticipants.length > 0
              ? totalDuration / completedParticipants.length
              : 0,
          averageSatisfaction:
            completedParticipants.length > 0
              ? totalSatisfaction / completedParticipants.length
              : 0,
        },
      }
    })

    return NextResponse.json({ conditions: conditionsWithStats })
  } catch (error: any) {
    console.error('[API] Error fetching conditions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conditions' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * POST /api/admin/conditions
 * Create a new condition
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await req.json()

    const { responseTime, communicationStyle, ageGroup } = body

    // Validation
    if (!responseTime || !communicationStyle || !ageGroup) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: responseTime, communicationStyle, ageGroup',
        },
        { status: 400 }
      )
    }

    // Validate enum values
    if (!Object.values(ResponseTime).includes(responseTime)) {
      return NextResponse.json(
        { error: `Invalid responseTime value: ${responseTime}` },
        { status: 400 }
      )
    }

    if (!Object.values(CommStyle).includes(communicationStyle)) {
      return NextResponse.json(
        { error: `Invalid communicationStyle value: ${communicationStyle}` },
        { status: 400 }
      )
    }

    if (!Object.values(AgeGroup).includes(ageGroup)) {
      return NextResponse.json(
        { error: `Invalid ageGroup value: ${ageGroup}` },
        { status: 400 }
      )
    }

    // Check for duplicate condition combination
    const existing = await prisma.condition.findUnique({
      where: {
        responseTime_communicationStyle_ageGroup: {
          responseTime: responseTime as ResponseTime,
          communicationStyle: communicationStyle as CommStyle,
          ageGroup: ageGroup as AgeGroup,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          error: `Condition with this combination already exists (ID: ${existing.id})`,
          existingId: existing.id,
        },
        { status: 409 }
      )
    }

    // Create condition
    const condition = await prisma.condition.create({
      data: {
        responseTime: responseTime as ResponseTime,
        communicationStyle: communicationStyle as CommStyle,
        ageGroup: ageGroup as AgeGroup,
        participantCount: 0,
      },
    })

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.CREATE_CONDITION,
      description: `יצר תנאי חדש: ${responseTime} + ${communicationStyle} + ${ageGroup}`,
      metadata: {
        conditionId: condition.id,
        responseTime,
        communicationStyle,
        ageGroup,
      },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({ condition }, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating condition:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create condition' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
