import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { CommStyle } from '@prisma/client'

/**
 * POST /api/admin/chat-messages/preview
 * Generate a preview of the complete chat flow for a given condition
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin()

    const body = await req.json()
    const { conditionId } = body

    if (!conditionId) {
      return NextResponse.json(
        { error: 'Missing required field: conditionId' },
        { status: 400 }
      )
    }

    // Fetch condition
    const condition = await prisma.condition.findUnique({
      where: { id: parseInt(conditionId) },
    })

    if (!condition) {
      return NextResponse.json({ error: 'Condition not found' }, { status: 404 })
    }

    // Fetch all active messages
    const messages = await prisma.chatMessage.findMany({
      where: { isActive: true },
      orderBy: [{ stepNumber: 'asc' }, { order: 'asc' }],
    })

    // Generate preview flow
    const preview = []
    const style = condition.communicationStyle

    for (const msg of messages) {
      let content = ''
      let appliedStyle = 'FIXED'

      if (msg.isFixed) {
        content = msg.fixedContent || ''
        appliedStyle = 'FIXED'
      } else if (style === CommStyle.FORMAL) {
        content = msg.formalContent || ''
        appliedStyle = 'FORMAL'
      } else {
        content = msg.friendlyContent || ''
        appliedStyle = 'FRIENDLY'
      }

      // Handle template variables (e.g., {months})
      // For preview purposes, use example values
      if (content.includes('{months}')) {
        content = content.replace('{months}', '4') // Example: X-2 where X=6
      }

      preview.push({
        id: msg.id,
        stepNumber: msg.stepNumber,
        messageKey: msg.messageKey,
        sender: msg.sender,
        content,
        appliedStyle,
        description: msg.description,
        order: msg.order,
      })
    }

    return NextResponse.json({
      preview,
      condition: {
        id: condition.id,
        responseTime: condition.responseTime,
        communicationStyle: condition.communicationStyle,
        ageGroup: condition.ageGroup,
      },
      metadata: {
        totalMessages: preview.length,
        style: style,
        previewGenerated: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('[API] Error generating preview:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
