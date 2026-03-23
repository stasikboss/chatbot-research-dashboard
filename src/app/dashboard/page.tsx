'use client'

import { useEffect, useState } from 'react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ConditionTable } from '@/components/dashboard/ConditionTable'
import { DashboardStats, ConditionStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">אין נתונים להצגה</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">דשבורד מחקר</h1>
        <p className="text-gray-600 mt-2">סקירה כללית של המחקר ונתוניו</p>
      </div>

      <StatsCards stats={stats} />

      <ConditionTable stats={stats.byCondition} />
    </div>
  )
}
