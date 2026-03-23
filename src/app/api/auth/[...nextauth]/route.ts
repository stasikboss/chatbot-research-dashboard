import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const researcher = await prisma.researcher.findUnique({
          where: { email: credentials.email },
        })

        if (!researcher) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          researcher.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: researcher.id,
          email: researcher.email,
          name: researcher.name,
          role: researcher.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/dashboard/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role

        // Create login session on first sign in
        try {
          // Update lastLoginAt
          await prisma.researcher.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })

          // Create login session record
          const sessionToken = `session_${user.id}_${Date.now()}`
          await prisma.loginSession.create({
            data: {
              researcherId: user.id,
              sessionToken,
              isActive: true,
            },
          })

          // Log login activity
          await logActivity({
            researcherId: user.id,
            action: ActivityType.LOGIN,
            description: 'התחבר למערכת',
          })

          // Store session token in JWT for later logout
          token.sessionToken = sessionToken
        } catch (error) {
          console.error('Failed to create login session:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Safely access token properties
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
        (session.user as any).sessionToken = token.sessionToken as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
