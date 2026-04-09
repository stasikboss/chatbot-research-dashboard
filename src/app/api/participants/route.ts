import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AgeGroup, Status } from '@prisma/client'
import { validateAge } from '@/lib/utils'
import { createParticipantAccessToken } from '@/lib/participant-access'
import { getClientIp } from '@/lib/ip-helpers'
import { checkRateLimit } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/auth-helpers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request) || 'unknown'
    const rateLimit = checkRateLimit(`participants:create:${ip}`, 15, 60 * 1000)
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

    const { age, ageGroup: userAgeGroup, gender, deviceFingerprint, adminMode } = body

    // Validate age
    const ageValidation = validateAge(age)
    if (!ageValidation.valid) {
      return NextResponse.json(
        { error: ageValidation.error },
        { status: 400 }
      )
    }

    // Check if device fingerprint already participated (skip for admin mode)
    if (!adminMode) {
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          deviceFingerprint,
        },
      })

      if (existingParticipant) {
        return NextResponse.json(
          {
            alreadyParticipated: true,
            error: 'כבר השתתפת בניסוי זה',
          },
          { status: 403 }
        )
      }
    }

    // Get age group for condition (YOUNG or OLD)
    const ageGroup = ageValidation.ageGroup as 'YOUNG' | 'OLD'

    // Find condition with lowest participant count for this age group
    const conditions = await prisma.condition.findMany({
      where: {
        ageGroup: AgeGroup[ageGroup],
      },
      orderBy: {
        participantCount: 'asc',
      },
    })

    if (conditions.length === 0) {
      return NextResponse.json(
        { error: 'No conditions available' },
        { status: 500 }
      )
    }

    // Select condition with lowest count (balanced randomization)
    const selectedCondition = conditions[0]

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        age,
        ageGroup: userAgeGroup || null,
        gender: gender || null,
        isTestUser: adminMode || false,
        deviceFingerprint,
        conditionId: selectedCondition.id,
        status: Status.IN_PROGRESS,
        currentStep: 1,
      },
      include: {
        condition: true,
      },
    })

    // Increment participant count for this condition (only for real participants)
    if (!adminMode) {
      await prisma.condition.update({
        where: { id: selectedCondition.id },
        data: {
          participantCount: {
            increment: 1,
          },
        },
      })
    }

    return NextResponse.json({
      participantId: participant.id,
      conditionId: participant.conditionId,
      condition: participant.condition,
      participantToken: createParticipantAccessToken(participant.id),
    })
  } catch (error) {
    console.error('Error creating participant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId required' },
        { status: 400 }
      )
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      include: {
        condition: true,
        messages: {
          orderBy: { timestamp: 'asc' },
        },
        result: true,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(participant)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error fetching participant:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
