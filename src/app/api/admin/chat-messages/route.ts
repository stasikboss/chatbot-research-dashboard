import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType, MessageSender } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'
import { invalidateMessageCache } from '@/lib/message-fetcher'

/**
 * GET /api/admin/chat-messages
 * Fetch all chat messages with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(req.url)
    const stepNumber = searchParams.get('stepNumber')
    const sender = searchParams.get('sender')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')

    const where: any = {}

    if (stepNumber) {
      where.stepNumber = parseInt(stepNumber)
    }

    if (sender && Object.values(MessageSender).includes(sender as MessageSender)) {
      where.sender = sender as MessageSender
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { messageKey: { contains: search, mode: 'insensitive' } },
        { formalContent: { contains: search, mode: 'insensitive' } },
        { friendlyContent: { contains: search, mode: 'insensitive' } },
        { fixedContent: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: [{ stepNumber: 'asc' }, { order: 'asc' }],
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error('[API] Error fetching chat messages:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * POST /api/admin/chat-messages
 * Create a new chat message
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await req.json()

    const {
      stepNumber,
      messageKey,
      sender,
      isFixed,
      formalContent,
      friendlyContent,
      fixedContent,
      description,
      isActive,
      order,
    } = body

    // Validation
    if (!stepNumber || !messageKey || !sender) {
      return NextResponse.json(
        { error: 'Missing required fields: stepNumber, messageKey, sender' },
        { status: 400 }
      )
    }

    if (!Object.values(MessageSender).includes(sender)) {
      return NextResponse.json(
        { error: 'Invalid sender value. Must be BOT, USER, or SYSTEM' },
        { status: 400 }
      )
    }

    // Validate content based on isFixed
    if (isFixed) {
      if (!fixedContent) {
        return NextResponse.json(
          { error: 'fixedContent is required when isFixed is true' },
          { status: 400 }
        )
      }
    } else {
      if (!formalContent || !friendlyContent) {
        return NextResponse.json(
          {
            error:
              'formalContent and friendlyContent are required when isFixed is false',
          },
          { status: 400 }
        )
      }
    }

    // Check for unique messageKey
    const existing = await prisma.chatMessage.findUnique({
      where: { messageKey },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Message with key '${messageKey}' already exists` },
        { status: 409 }
      )
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        stepNumber: parseInt(stepNumber),
        messageKey,
        sender: sender as MessageSender,
        isFixed: isFixed || false,
        formalContent: isFixed ? null : formalContent,
        friendlyContent: isFixed ? null : friendlyContent,
        fixedContent: isFixed ? fixedContent : null,
        description,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        createdBy: (session.user as any).id,
      },
    })

    // Invalidate cache so new message is loaded
    invalidateMessageCache()

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.CREATE_CHAT_MESSAGE,
      description: `יצר הודעת צ'אט חדשה: ${messageKey} (שלב ${stepNumber})`,
      metadata: {
        messageId: message.id,
        messageKey,
        stepNumber,
        sender,
        isFixed,
      },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating chat message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create message' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
