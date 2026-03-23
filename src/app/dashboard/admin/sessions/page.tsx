'use client'

import { useEffect, useState } from 'react'
import { SessionTable } from '@/components/admin/SessionTable'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LoginSession {
  id: string
  loginTime: Date
  logoutTime: Date | null
  isActive: boolean
  ipAddress: string | null
  deviceInfo: string | null
  durationSeconds: number | null
  researcher: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<LoginSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    researcherId: '',
    isActive: '',
    fromDate: '',
    toDate: '',
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.researcherId) params.append('researcherId', filters.researcherId)
      if (filters.isActive) params.append('isActive', filters.isActive)
      if (filters.fromDate) params.append('fromDate', filters.fromDate)
      if (filters.toDate) params.append('toDate', filters.toDate)

      const res = await fetch(`/api/admin/sessions?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions)
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    setLoading(true)
    fetchSessions()
  }

  const handleResetFilters = () => {
    setFilters({
      researcherId: '',
      isActive: '',
      fromDate: '',
      toDate: '',
    })
    setLoading(true)
    setTimeout(() => fetchSessions(), 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">טוען...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">היסטוריית כניסות</h1>
        <p className="text-gray-500 mt-2">
          מעקב אחר כניסות ויציאות של חוקרים במערכת
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">סינון</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סטטוס
            </label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">הכל</option>
              <option value="true">פעיל</option>
              <option value="false">הסתיים</option>
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

      {/* Sessions Table */}
      <SessionTable sessions={sessions} />

      {/* Stats */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">סטטיסטיקות</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">סה"כ התחברויות</p>
            <p className="text-2xl font-bold mt-1">{sessions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">פעילים כעת</p>
            <p className="text-2xl font-bold mt-1">
              {sessions.filter((s) => s.isActive).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">הסתיימו</p>
            <p className="text-2xl font-bold mt-1">
              {sessions.filter((s) => !s.isActive).length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
