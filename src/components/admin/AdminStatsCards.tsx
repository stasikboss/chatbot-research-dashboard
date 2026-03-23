'use client'

import { Card } from '@/components/ui/card'
import { Users, UserCog, Activity, LogIn } from 'lucide-react'

interface AdminStatsCardsProps {
  stats: {
    researchers: {
      total: number
      admins: number
      researchers: number
      active: number
      activeToday: number
    }
    participants: {
      total: number
      completed: number
      inProgress: number
      abandoned: number
    }
    activity: {
      loginsToday: number
    }
  }
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Researchers */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">סה"כ חוקרים</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold">{stats.researchers.total}</p>
              <p className="text-sm text-gray-500">
                ({stats.researchers.active} פעילים)
              </p>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {stats.researchers.admins} מנהלים, {stats.researchers.researchers} חוקרים
            </p>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Active Today */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">פעילים היום</p>
            <p className="mt-2 text-2xl font-bold">
              {stats.researchers.activeToday}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {stats.activity.loginsToday} כניסות
            </p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Total Participants */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">סה"כ משתתפים</p>
            <p className="mt-2 text-2xl font-bold">
              {stats.participants.total}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {stats.participants.completed} הושלמו
            </p>
          </div>
          <div className="rounded-full bg-purple-100 p-3">
            <UserCog className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </Card>

      {/* Completion Rate */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">שיעור השלמה</p>
            <p className="mt-2 text-2xl font-bold">
              {stats.participants.total > 0
                ? Math.round(
                    (stats.participants.completed / stats.participants.total) * 100
                  )
                : 0}
              %
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {stats.participants.inProgress} בתהליך
            </p>
          </div>
          <div className="rounded-full bg-orange-100 p-3">
            <LogIn className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </Card>
    </div>
  )
}
