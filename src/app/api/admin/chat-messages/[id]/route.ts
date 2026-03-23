import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType, MessageSender } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'
import { invalidateMessageCache } from '@/lib/message-fetcher'

/**
 * GET /api/admin/chat-messages/[id]
 * Fetch a single chat message by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const messageId = parseInt(params.id)
    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('[API] Error fetching chat message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch message' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * PATCH /api/admin/chat-messages/[id]
 * Update a chat message
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const messageId = parseInt(params.id)

    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
    }

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

    // Check if message exists
    const existingMessage = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!existingMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if there are active participants using this step
    if (stepNumber && stepNumber !== existingMessage.stepNumber) {
      const activeParticipantsCount = await prisma.participant.count({
        where: {
          status: 'IN_PROGRESS',
          currentStep: existingMessage.stepNumber,
        },
      })

      if (activeParticipantsCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot change step number: ${activeParticipantsCount} active participants are currently on step ${existingMessage.stepNumber}`,
            activeParticipants: activeParticipantsCount,
          },
          { status: 409 }
        )
      }
    }

    // Check for unique messageKey if changing
    if (messageKey && messageKey !== existingMessage.messageKey) {
      const duplicate = await prisma.chatMessage.findUnique({
        where: { messageKey },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: `Message with key '${messageKey}' already exists` },
          { status: 409 }
        )
      }
    }

    // Validate sender if provided
    if (sender && !Object.values(MessageSender).includes(sender)) {
      return NextResponse.json(
        { error: 'Invalid sender value. Must be BOT, USER, or SYSTEM' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      lastEditedBy: (session.user as any).id,
      updatedAt: new Date(),
    }

    if (stepNumber !== undefined) updateData.stepNumber = parseInt(stepNumber)
    if (messageKey !== undefined) updateData.messageKey = messageKey
    if (sender !== undefined) updateData.sender = sender
    if (isFixed !== undefined) updateData.isFixed = isFixed
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive
    if (order !== undefined) updateData.order = order

    // Handle content updates based on isFixed
    const newIsFixed = isFixed !== undefined ? isFixed : existingMessage.isFixed

    if (newIsFixed) {
      updateData.fixedContent = fixedContent || existingMessage.fixedContent
      updateData.formalContent = null
      updateData.friendlyContent = null
    } else {
      updateData.formalContent =
        formalContent !== undefined
          ? formalContent
          : existingMessage.formalContent
      updateData.friendlyContent =
        friendlyContent !== undefined
          ? friendlyContent
          : existingMessage.friendlyContent
      updateData.fixedContent = null
    }

    // Update message
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: updateData,
    })

    // Invalidate cache
    invalidateMessageCache()

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.UPDATE_CHAT_MESSAGE,
      description: `עדכן הודעת צ'אט: ${updatedMessage.messageKey}`,
      metadata: {
        messageId: updatedMessage.id,
        messageKey: updatedMessage.messageKey,
        changes: body,
      },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({ message: updatedMessage })
  } catch (error: any) {
    console.error('[API] Error updating chat message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update message' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * DELETE /api/admin/chat-messages/[id]
 * Delete or deactivate a chat message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const messageId = parseInt(params.id)

    if (isNaN(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const force = searchParams.get('force') === 'true'

    // Check if message exists
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if there are active participants using this step
    const activeParticipantsCount = await prisma.participant.count({
      where: {
        status: 'IN_PROGRESS',
        currentStep: message.stepNumber,
      },
    })

    if (activeParticipantsCount > 0 && !force) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${activeParticipantsCount} active participants are currently on step ${message.stepNumber}`,
          activeParticipants: activeParticipantsCount,
          suggestion: 'Use soft delete (deactivate) or wait for participants to complete',
        },
        { status: 409 }
      )
    }

    let deletedMessage

    if (force) {
      // Hard delete
      deletedMessage = await prisma.chatMessage.delete({
        where: { id: messageId },
      })
    } else {
      // Soft delete - just deactivate
      deletedMessage = await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isActive: false },
      })
    }

    // Invalidate cache
    invalidateMessageCache()

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.DELETE_CHAT_MESSAGE,
      description: `${force ? 'מחק' : 'השבית'} הודעת צ'אט: ${message.messageKey}`,
      metadata: {
        messageId: message.id,
        messageKey: message.messageKey,
        stepNumber: message.stepNumber,
        forceDelete: force,
        activeParticipantsAtTime: activeParticipantsCount,
      },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({
      success: true,
      message: force ? 'Message deleted successfully' : 'Message deactivated successfully',
      deletedMessage,
    })
  } catch (error: any) {
    console.error('[API] Error deleting chat message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete message' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
