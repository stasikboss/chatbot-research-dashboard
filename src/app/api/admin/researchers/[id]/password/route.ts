import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'
import bcrypt from 'bcryptjs'

/**
 * POST /api/admin/researchers/[id]/password
 * Change a researcher's password
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const body = await req.json()

    const { newPassword } = body

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Get researcher
    const researcher = await prisma.researcher.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true },
    })

    if (!researcher) {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.researcher.update({
      where: { id: params.id },
      data: { password: hashedPassword },
    })

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.CHANGE_PASSWORD,
      description: `שינה סיסמה עבור ${researcher.name}`,
      metadata: { targetResearcherId: params.id },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('POST /api/admin/researchers/[id]/password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
