import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Sender, Status } from '@prisma/client'
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
    const rateLimit = checkRateLimit(`messages:post:${ip}`, 40, 60 * 1000)
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

    const { participantId, sender, content, stepNumber, updateStep, resultData } = body

    // Validate required fields
    if (!participantId || !sender || !content || stepNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const isAuthorized = await isAuthorizedParticipantRequest(request, participantId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        participantId,
        sender: Sender[sender as keyof typeof Sender],
        content,
        stepNumber,
      },
    })

    // Update participant if requested
    if (updateStep !== undefined) {
      await prisma.participant.update({
        where: { id: participantId },
        data: {
          currentStep: updateStep,
        },
      })
    }

    // If result data is provided, create or update result
    if (resultData) {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
        select: { createdAt: true },
      })

      if (participant) {
        const totalDurationSeconds = Math.floor(
          (Date.now() - new Date(participant.createdAt).getTime()) / 1000
        )

        await prisma.result.upsert({
          where: { participantId },
          update: {
            ...resultData,
            totalDurationSeconds,
          },
          create: {
            participantId,
            ...resultData,
            totalDurationSeconds,
          },
        })
      }
    }

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId required' },
        { status: 400 }
      )
    }

    const isAuthorized = await isAuthorizedParticipantRequest(request, participantId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await prisma.message.findMany({
      where: { participantId },
      orderBy: { timestamp: 'asc' },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request) || 'unknown'
    const rateLimit = checkRateLimit(`messages:patch:${ip}`, 20, 60 * 1000)
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

    const { participantId, status, completedAt } = body

    if (!participantId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const isAuthorized = await isAuthorizedParticipantRequest(request, participantId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updateData: any = {
      status: Status[status as keyof typeof Status],
    }

    if (completedAt) {
      updateData.completedAt = new Date(completedAt)
    }

    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: updateData,
    })

    return NextResponse.json({ success: true, participant })
  } catch (error) {
    console.error('Error updating participant status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
