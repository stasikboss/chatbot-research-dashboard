'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { Role } from '@prisma/client'
import { Shield, Workflow } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/dashboard/login') {
      router.push('/dashboard/login')
    }
  }, [status, pathname, router])

  if (pathname === '/dashboard/login') {
    return <>{children}</>
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAdmin = (session.user as any)?.role === Role.ADMIN

  const handleSignOut = async () => {
    // Call logout API to update session
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout API error:', error)
    }
    // Sign out from NextAuth
    signOut({ callbackUrl: '/dashboard/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex gap-8">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                סקירה
              </Link>
              <Link
                href="/dashboard/participants"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                משתתפים
              </Link>
              <Link
                href="/dashboard/export"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                ייצוא
              </Link>
              <Link
                href="/dashboard/flow"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Workflow className="h-4 w-4" />
                תרשים זרימה
              </Link>

              {/* Admin Navigation - Only for ADMIN role */}
              {isAdmin && (
                <>
                  <div className="border-r border-gray-300 mx-2" />
                  <Link
                    href="/dashboard/admin"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                  >
                    <Shield className="h-4 w-4" />
                    ניהול מערכת
                  </Link>
                  <Link
                    href="/dashboard/admin/researchers"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    חוקרים
                  </Link>
                  <Link
                    href="/dashboard/admin/sessions"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    התחברויות
                  </Link>
                  <Link
                    href="/dashboard/admin/activity"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    פעילות
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {(session.user as any)?.name || session.user?.email}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'מנהל' : 'חוקר'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                התנתק
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
