import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { Role } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Check if accessing admin routes
    if (pathname.startsWith('/dashboard/admin')) {
      // Redirect non-admins to main dashboard
      if (token?.role !== Role.ADMIN) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Allow login page without authentication
        if (pathname === '/dashboard/login') {
          return true
        }

        // Require authentication for all dashboard pages
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }

        // Allow all other pages
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}
