'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ConditionStatsModalProps {
  isOpen: boolean
  onClose: () => void
  conditionId: number | null
}

export function ConditionStatsModal({
  isOpen,
  onClose,
  conditionId,
}: ConditionStatsModalProps) {
  const [condition, setCondition] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && conditionId) {
      loadStats()
    }
  }, [isOpen, conditionId])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/conditions/${conditionId}`)
      if (response.ok) {
        const data = await response.json()
        setCondition(data.condition)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!condition && !loading) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>סטטיסטיקות מפורטות - תנאי #{conditionId}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">טוען...</div>
        ) : condition ? (
          <div className="space-y-6">
            {/* Condition Details */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">פרטי התנאי</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">זמן תגובה</div>
                  <div className="font-medium">{condition.responseTime}</div>
                </div>
                <div>
                  <div className="text-gray-600">סגנון</div>
                  <div className="font-medium">{condition.communicationStyle}</div>
                </div>
                <div>
                  <div className="text-gray-600">קבוצת גיל</div>
                  <div className="font-medium">{condition.ageGroup}</div>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-gray-600">סך משתתפים</div>
                <div className="text-2xl font-bold">
                  {condition.stats.totalParticipants}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">הושלמו</div>
                <div className="text-2xl font-bold text-green-600">
                  {condition.stats.completedCount}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">בתהליך</div>
                <div className="text-2xl font-bold text-blue-600">
                  {condition.stats.inProgressCount}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600">ננטשו</div>
                <div className="text-2xl font-bold text-red-600">
                  {condition.stats.abandonedCount}
                </div>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">מדדי ביצוע</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">אחוז השלמה</div>
                  <div className="text-xl font-bold">
                    {condition.stats.completionRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">משך ממוצע</div>
                  <div className="text-xl font-bold">
                    {Math.floor(condition.stats.averageDuration / 60)}:
                    {Math.floor(condition.stats.averageDuration % 60)
                      .toString()
                      .padStart(2, '0')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">שביעות רצון ממוצעת</div>
                  <div className="text-xl font-bold">
                    {condition.stats.averageSatisfaction.toFixed(2)} / 7
                  </div>
                </div>
              </div>
            </Card>

            {condition.stats.negotiationParticipationRate !== undefined && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">משא ומתן</h3>
                <div className="text-sm">
                  <span className="text-gray-600">אחוז השתתפות:</span>{' '}
                  <span className="font-bold">
                    {condition.stats.negotiationParticipationRate.toFixed(1)}%
                  </span>
                </div>
              </Card>
            )}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={onClose}>סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
