import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyParticipantAccessToken } from '@/lib/participant-access'
import { requireAuth } from '@/lib/auth-helpers'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/ip-helpers'

export const dynamic = 'force-dynamic'

async function isAuthorizedParticipantRequest(
  request: NextRequest,
  participantId: string
): Promise<boolean> {
  const participantToken = request.headers.get('x-participant-token')

  if (verifyParticipantAccessToken(participantId, participantToken)) {
    return true
  }

  try {
    await requireAuth()
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request) || 'unknown'
    const rateLimit = checkRateLimit(`questionnaire:post:${ip}`, 20, 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

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

    const isAuthorized = await isAuthorizedParticipantRequest(request, participantId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
