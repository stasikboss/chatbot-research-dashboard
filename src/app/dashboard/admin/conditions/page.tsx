'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConditionsTable } from '@/components/admin/ConditionsTable'
import { ConditionStatsModal } from '@/components/admin/ConditionStatsModal'
import { ConditionDeleteModal } from '@/components/admin/ConditionDeleteModal'
import { ResetCountModal } from '@/components/admin/ResetCountModal'
import { Card } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function ConditionsPage() {
  const router = useRouter()
  const [conditions, setConditions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [statsModalOpen, setStatsModalOpen] = useState(false)
  const [statsConditionId, setStatsConditionId] = useState<number | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<any>(null)

  useEffect(() => {
    loadConditions()
  }, [])

  const loadConditions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/conditions')
      if (!response.ok) throw new Error('Failed to load conditions')
      const data = await response.json()
      setConditions(data.conditions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    const condition = conditions.find((c: any) => c.id === id)
    if (condition) {
      setDeleteTarget(condition)
      setDeleteModalOpen(true)
    }
  }

  const confirmDelete = async (forceDelete: boolean) => {
    if (!deleteTarget) return

    try {
      const response = await fetch(
        `/api/admin/conditions/${deleteTarget.id}?force=${forceDelete}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete condition')
      }

      await loadConditions()
      setDeleteModalOpen(false)
      setDeleteTarget(null)
    } catch (error: any) {
      alert(`שגיאה במחיקה: ${error.message}`)
    }
  }

  const handleResetCount = (id: number) => {
    const condition = conditions.find((c: any) => c.id === id)
    if (condition) {
      setResetTarget(condition)
      setResetModalOpen(true)
    }
  }

  const confirmResetCount = async () => {
    if (!resetTarget) return

    try {
      const response = await fetch(
        `/api/admin/conditions/${resetTarget.id}/reset-count`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error('Failed to reset count')
      }

      await loadConditions()
      setResetModalOpen(false)
      setResetTarget(null)
    } catch (error: any) {
      alert(`שגיאה באיפוס: ${error.message}`)
    }
  }

  const handleViewStats = (id: number) => {
    setStatsConditionId(id)
    setStatsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">טוען...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">שגיאה: {error}</div>
      </div>
    )
  }

  const totalParticipants = conditions.reduce(
    (sum: number, c: any) => sum + c.participantCount,
    0
  )
  const totalCompleted = conditions.reduce(
    (sum: number, c: any) => sum + c.stats.completedCount,
    0
  )

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">ניהול תנאים ניסויים</h1>
        </div>
        <p className="text-gray-600">
          נהל את 12 התנאים הניסויים (3 זמני תגובה × 2 סגנונות × 2 קבוצות גיל)
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">סך תנאים</div>
          <div className="text-2xl font-bold">{conditions.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">סך משתתפים</div>
          <div className="text-2xl font-bold">{totalParticipants}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">הושלמו</div>
          <div className="text-2xl font-bold text-green-600">
            {totalCompleted}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">אחוז השלמה כולל</div>
          <div className="text-2xl font-bold">
            {totalParticipants > 0
              ? ((totalCompleted / totalParticipants) * 100).toFixed(1)
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-6">
        <ConditionsTable
          conditions={conditions}
          onDelete={handleDelete}
          onResetCount={handleResetCount}
          onViewStats={handleViewStats}
        />
      </Card>

      {/* Modals */}
      <ConditionStatsModal
        isOpen={statsModalOpen}
        onClose={() => {
          setStatsModalOpen(false)
          setStatsConditionId(null)
        }}
        conditionId={statsConditionId}
      />

      <ConditionDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={confirmDelete}
        condition={deleteTarget}
      />

      <ResetCountModal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false)
          setResetTarget(null)
        }}
        onConfirm={confirmResetCount}
        condition={resetTarget}
      />
    </div>
  )
}
