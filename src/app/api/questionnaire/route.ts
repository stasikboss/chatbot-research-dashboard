import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      participantId,
      processSatisfaction,
      outcomeSatisfaction,
      futureIntention,
      feedback,
      ageGroup,
      gender,
    } = body

    // Validate required fields
    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      )
    }

    if (!processSatisfaction || !outcomeSatisfaction || !futureIntention) {
      return NextResponse.json(
        { error: 'All satisfaction questions are required' },
        { status: 400 }
      )
    }

    if (!ageGroup || !gender) {
      return NextResponse.json(
        { error: 'Demographics are required' },
        { status: 400 }
      )
    }

    // Check if participant exists
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Save questionnaire response
    const response = await prisma.questionnaireResponse.create({
      data: {
        participantId,
        processSatisfaction,
        outcomeSatisfaction,
        futureIntention,
        feedback: feedback || null,
        ageGroup,
        gender,
      },
    })

    return NextResponse.json({ success: true, response })
  } catch (error) {
    console.error('Error saving questionnaire:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
