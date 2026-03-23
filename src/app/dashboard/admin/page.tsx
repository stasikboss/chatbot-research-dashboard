import { requireAdmin } from '@/lib/auth-helpers'
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'
import { ActivityTimeline } from '@/components/admin/ActivityTimeline'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Role, Status } from '@prisma/client'

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalResearchers,
    adminCount,
    researcherCount,
    activeResearchers,
    totalParticipants,
    completedParticipants,
    inProgressParticipants,
    abandonedParticipants,
    todayLogins,
    activeToday,
  ] = await Promise.all([
    prisma.researcher.count(),
    prisma.researcher.count({ where: { role: Role.ADMIN } }),
    prisma.researcher.count({ where: { role: Role.RESEARCHER } }),
    prisma.researcher.count({ where: { isActive: true } }),
    prisma.participant.count(),
    prisma.participant.count({ where: { status: Status.COMPLETED } }),
    prisma.participant.count({ where: { status: Status.IN_PROGRESS } }),
    prisma.participant.count({ where: { status: Status.ABANDONED } }),
    prisma.loginSession.count({ where: { loginTime: { gte: today } } }),
    prisma.loginSession.findMany({
      where: { loginTime: { gte: today } },
      select: { researcherId: true },
      distinct: ['researcherId'],
    }),
  ])

  return {
    researchers: {
      total: totalResearchers,
      admins: adminCount,
      researchers: researcherCount,
      active: activeResearchers,
      activeToday: activeToday.length,
    },
    participants: {
      total: totalParticipants,
      completed: completedParticipants,
      inProgress: inProgressParticipants,
      abandoned: abandonedParticipants,
    },
    activity: {
      loginsToday: todayLogins,
    },
  }
}

async function getRecentActivity() {
  return await prisma.activityLog.findMany({
    include: {
      researcher: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    take: 20,
  })
}

export default async function AdminDashboardPage() {
  await requireAdmin()

  const [stats, activities] = await Promise.all([
    getStats(),
    getRecentActivity(),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">לוח בקרה - ניהול</h1>
        <p className="text-gray-500 mt-2">
          סקירה כללית של המערכת, חוקרים ומשתתפים
        </p>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards stats={stats} />

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Link href="/dashboard/admin/chat-messages">
          <Card className="p-6 hover:bg-gray-50 transition cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">ניהול הודעות</h3>
            <p className="text-sm text-gray-500">
              ניהול תזרים השיחה והודעות הצ'אט
            </p>
            <ArrowLeft className="h-5 w-5 mt-4 text-blue-600" />
          </Card>
        </Link>

        <Link href="/dashboard/admin/conditions">
          <Card className="p-6 hover:bg-gray-50 transition cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">ניהול תנאים</h3>
            <p className="text-sm text-gray-500">
              ניהול 12 התנאים הניסויים
            </p>
            <ArrowLeft className="h-5 w-5 mt-4 text-blue-600" />
          </Card>
        </Link>

        <Link href="/dashboard/admin/researchers">
          <Card className="p-6 hover:bg-gray-50 transition cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">ניהול חוקרים</h3>
            <p className="text-sm text-gray-500">
              צפייה, הוספה ועריכת חוקרים במערכת
            </p>
            <ArrowLeft className="h-5 w-5 mt-4 text-blue-600" />
          </Card>
        </Link>

        <Link href="/dashboard/admin/sessions">
          <Card className="p-6 hover:bg-gray-50 transition cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">היסטוריית כניסות</h3>
            <p className="text-sm text-gray-500">
              מעקב אחר כניסות ויציאות של חוקרים
            </p>
            <ArrowLeft className="h-5 w-5 mt-4 text-blue-600" />
          </Card>
        </Link>

        <Link href="/dashboard/admin/activity">
          <Card className="p-6 hover:bg-gray-50 transition cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">לוג פעילות</h3>
            <p className="text-sm text-gray-500">
              צפייה בכל הפעולות שבוצעו במערכת
            </p>
            <ArrowLeft className="h-5 w-5 mt-4 text-blue-600" />
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">פעילות אחרונה</h2>
          <Link
            href="/dashboard/admin/activity"
            className="text-sm text-blue-600 hover:underline"
          >
            צפה בכל הפעילות
          </Link>
        </div>
        <ActivityTimeline activities={activities} />
      </Card>
    </div>
  )
}
