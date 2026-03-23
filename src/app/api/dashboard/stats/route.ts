import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Status } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Get all participants with relations
    const participants = await prisma.participant.findMany({
      include: {
        condition: true,
        result: true,
      },
    })

    // Calculate overall stats
    const totalParticipants = participants.length
    const completed = participants.filter((p) => p.status === Status.COMPLETED).length
    const inProgress = participants.filter((p) => p.status === Status.IN_PROGRESS).length
    const abandoned = participants.filter((p) => p.status === Status.ABANDONED).length

    // Get all conditions
    const conditions = await prisma.condition.findMany({
      orderBy: { id: 'asc' },
    })

    // Calculate stats by condition
    const byCondition = conditions.map((condition) => {
      const conditionParticipants = participants.filter((p) => p.conditionId === condition.id)
      const conditionCompleted = conditionParticipants.filter((p) => p.status === Status.COMPLETED)

      const durations = conditionCompleted
        .map((p) => p.result?.totalDurationSeconds)
        .filter((d): d is number => d !== null && d !== undefined)

      const satisfactions = conditionCompleted
        .map((p) => p.result?.satisfactionScore)
        .filter((s): s is number => s !== null && s !== undefined)

      return {
        condition,
        participantCount: conditionParticipants.length,
        completedCount: conditionCompleted.length,
        averageDuration:
          durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0,
        averageSatisfaction:
          satisfactions.length > 0
            ? satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length
            : 0,
      }
    })

    return NextResponse.json({
      totalParticipants,
      completed,
      inProgress,
      abandoned,
      byCondition,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
