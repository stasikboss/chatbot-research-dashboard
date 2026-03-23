import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const researcherId = (session.user as any).id
    const sessionToken = (session.user as any).sessionToken

    // Update all active sessions for this researcher
    await prisma.loginSession.updateMany({
      where: {
        researcherId,
        isActive: true,
      },
      data: {
        logoutTime: new Date(),
        isActive: false,
      },
    })

    // If we have a specific session token, update that one
    if (sessionToken) {
      await prisma.loginSession.updateMany({
        where: {
          sessionToken,
          researcherId,
        },
        data: {
          logoutTime: new Date(),
          isActive: false,
        },
      })
    }

    // Log logout activity
    await logActivity({
      researcherId,
      action: ActivityType.LOGOUT,
      description: 'התנתק מהמערכת',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
