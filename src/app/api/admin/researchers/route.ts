import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType, Role } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'
import bcrypt from 'bcryptjs'

/**
 * GET /api/admin/researchers
 * Get all researchers
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin()

    const researchers = await prisma.researcher.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            loginSessions: true,
            activityLogs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ researchers })
  } catch (error: any) {
    console.error('GET /api/admin/researchers error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch researchers' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * POST /api/admin/researchers
 * Create a new researcher
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await req.json()

    const { email, name, password, role } = body

    // Validation
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await prisma.researcher.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create researcher
    const researcher = await prisma.researcher.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.CREATE_RESEARCHER,
      description: `יצר חוקר חדש: ${name} (${email})`,
      metadata: { targetResearcherId: researcher.id, role },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({ researcher }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/admin/researchers error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create researcher' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
