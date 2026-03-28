import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Sender, Status } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, sender, content, stepNumber, updateStep, resultData } = body

    // Validate required fields
    if (!participantId || !sender || !content || stepNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
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
    const body = await request.json()
    const { participantId, status, completedAt } = body

    if (!participantId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
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
