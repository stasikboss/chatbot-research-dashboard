import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { Role } from '@prisma/client'

/**
 * Requires authentication - returns the session or throws error
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('Unauthorized - Please log in')
  }

  return session
}

/**
 * Requires ADMIN role - returns the session or throws error
 */
export async function requireAdmin() {
  const session = await requireAuth()

  if (session.user.role !== Role.ADMIN) {
    throw new Error('Forbidden - Admin access required')
  }

  return session
}

/**
 * Check if user has ADMIN role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.role === Role.ADMIN
  } catch {
    return false
  }
}

/**
 * Get current researcher ID from session
 */
export async function getCurrentResearcherId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    return session?.user?.id || null
  } catch {
    return null
  }
}
