'use client'

import { useEffect, useState } from 'react'
import { ActivityTimeline } from '@/components/admin/ActivityTimeline'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActivityType } from '@prisma/client'

interface Activity {
  id: string
  action: ActivityType
  description: string
  timestamp: Date
  researcher: {
    id: string
    name: string
    email: string
    role: string
  }
}

const activityTypeLabels: Record<ActivityType, string> = {
  LOGIN: 'כניסה',
  LOGOUT: 'יציאה',
  VIEW_DASHBOARD: 'צפייה בדשבורד',
  VIEW_PARTICIPANTS: 'צפייה במשתתפים',
  VIEW_SESSION: 'צפייה בסשן',
  EXPORT_DATA: 'ייצוא נתונים',
  CREATE_RESEARCHER: 'יצירת חוקר',
  UPDATE_RESEARCHER: 'עדכון חוקר',
  DELETE_RESEARCHER: 'מחיקת חוקר',
  CHANGE_ROLE: 'שינוי תפקיד',
  CHANGE_PASSWORD: 'שינוי סיסמה',
  CREATE_CHAT_MESSAGE: 'יצירת הודעת צ\'אט',
  UPDATE_CHAT_MESSAGE: 'עדכון הודעת צ\'אט',
  DELETE_CHAT_MESSAGE: 'מחיקת הודעת צ\'אט',
  CREATE_CONDITION: 'יצירת תנאי',
  UPDATE_CONDITION: 'עדכון תנאי',
  DELETE_CONDITION: 'מחיקת תנאי',
  RESET_CONDITION_COUNTS: 'איפוס מונה משתתפים',
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    fromDate: '',
    toDate: '',
  })
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 50

  useEffect(() => {
    fetchActivities(true)
  }, [])

  const fetchActivities = async (reset: boolean = false) => {
    try {
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.fromDate) params.append('fromDate', filters.fromDate)
      if (filters.toDate) params.append('toDate', filters.toDate)
      params.append('limit', limit.toString())
      params.append('offset', reset ? '0' : offset.toString())

      const res = await fetch(`/api/admin/activity?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (reset) {
          setActivities(data.activities)
          setOffset(limit)
        } else {
          setActivities((prev) => [...prev, ...data.activities])
          setOffset((prev) => prev + limit)
        }
        setHasMore(data.activities.length === limit)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    setLoading(true)
    setOffset(0)
    fetchActivities(true)
  }

  const handleResetFilters = () => {
    setFilters({
      action: '',
      fromDate: '',
      toDate: '',
    })
    setLoading(true)
    setOffset(0)
    setTimeout(() => fetchActivities(true), 100)
  }

  const handleLoadMore = () => {
    fetchActivities(false)
  }

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">טוען...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">לוג פעילות</h1>
        <p className="text-gray-500 mt-2">
          צפייה בכל הפעולות שבוצעו במערכת על ידי חוקרים
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">סינון</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג פעולה
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">הכל</option>
              {Object.entries(activityTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מתאריך
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              עד תאריך
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              סנן
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              נקה
            </Button>
          </div>
        </div>
      </Card>

      {/* Activity Timeline */}
      <Card className="p-6">
        <ActivityTimeline activities={activities} />

        {hasMore && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={handleLoadMore}>
              טען עוד
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
