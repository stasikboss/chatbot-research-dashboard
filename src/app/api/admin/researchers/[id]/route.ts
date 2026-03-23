import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType, Role } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'

/**
 * GET /api/admin/researchers/[id]
 * Get a specific researcher
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const researcher = await prisma.researcher.findUnique({
      where: { id: params.id },
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
    })

    if (!researcher) {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ researcher })
  } catch (error: any) {
    console.error('GET /api/admin/researchers/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch researcher' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * PATCH /api/admin/researchers/[id]
 * Update a researcher
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()
    const body = await req.json()

    const { name, email, role, isActive } = body

    // Validation
    if (role && !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get current researcher data
    const currentResearcher = await prisma.researcher.findUnique({
      where: { id: params.id },
    })

    if (!currentResearcher) {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      )
    }

    // Check if trying to change own role
    if (role && (session.user as any).id === params.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Check if trying to deactivate last admin
    if (
      isActive === false &&
      currentResearcher.role === Role.ADMIN &&
      currentResearcher.isActive
    ) {
      const activeAdminCount = await prisma.researcher.count({
        where: {
          role: Role.ADMIN,
          isActive: true,
          id: { not: params.id },
        },
      })

      if (activeAdminCount === 0) {
        return NextResponse.json(
          { error: 'Cannot deactivate the last admin' },
          { status: 400 }
        )
      }
    }

    // Check if changing role from ADMIN
    if (
      role &&
      role !== Role.ADMIN &&
      currentResearcher.role === Role.ADMIN
    ) {
      const activeAdminCount = await prisma.researcher.count({
        where: {
          role: Role.ADMIN,
          isActive: true,
          id: { not: params.id },
        },
      })

      if (activeAdminCount === 0) {
        return NextResponse.json(
          { error: 'Cannot remove ADMIN role from the last admin' },
          { status: 400 }
        )
      }
    }

    // Update researcher
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    const researcher = await prisma.researcher.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Log activity
    const changes = []
    if (name && name !== currentResearcher.name) changes.push('שם')
    if (email && email !== currentResearcher.email) changes.push('אימייל')
    if (role && role !== currentResearcher.role) {
      changes.push('תפקיד')
      await logActivity({
        researcherId: (session.user as any).id,
        action: ActivityType.CHANGE_ROLE,
        description: `שינה תפקיד של ${currentResearcher.name} מ-${currentResearcher.role} ל-${role}`,
        metadata: {
          targetResearcherId: params.id,
          oldRole: currentResearcher.role,
          newRole: role,
        },
        ipAddress: getClientIp(req) || undefined,
      })
    }
    if (isActive !== undefined && isActive !== currentResearcher.isActive) {
      changes.push('סטטוס פעיל')
    }

    if (changes.length > 0 && !role) {
      await logActivity({
        researcherId: (session.user as any).id,
        action: ActivityType.UPDATE_RESEARCHER,
        description: `עדכן את ${currentResearcher.name}: ${changes.join(', ')}`,
        metadata: { targetResearcherId: params.id, changes },
        ipAddress: getClientIp(req) || undefined,
      })
    }

    return NextResponse.json({ researcher })
  } catch (error: any) {
    console.error('PATCH /api/admin/researchers/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update researcher' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}

/**
 * DELETE /api/admin/researchers/[id]
 * Delete a researcher
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin()

    // Check if trying to delete self
    if ((session.user as any).id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    // Get researcher
    const researcher = await prisma.researcher.findUnique({
      where: { id: params.id },
    })

    if (!researcher) {
      return NextResponse.json(
        { error: 'Researcher not found' },
        { status: 404 }
      )
    }

    // Check if deleting last admin
    if (researcher.role === Role.ADMIN) {
      const activeAdminCount = await prisma.researcher.count({
        where: {
          role: Role.ADMIN,
          isActive: true,
          id: { not: params.id },
        },
      })

      if (activeAdminCount === 0) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin' },
          { status: 400 }
        )
      }
    }

    // Delete researcher (cascade will delete sessions and logs)
    await prisma.researcher.delete({
      where: { id: params.id },
    })

    // Log activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.DELETE_RESEARCHER,
      description: `מחק חוקר: ${researcher.name} (${researcher.email})`,
      metadata: {
        targetResearcherId: params.id,
        name: researcher.name,
        email: researcher.email,
        role: researcher.role,
      },
      ipAddress: getClientIp(req) || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/admin/researchers/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete researcher' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    )
  }
}
