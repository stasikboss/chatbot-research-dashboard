'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ResetCountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  condition: {
    id: number
    responseTime: string
    communicationStyle: string
    ageGroup: string
    participantCount: number
  } | null
}

export function ResetCountModal({
  isOpen,
  onClose,
  onConfirm,
  condition,
}: ResetCountModalProps) {
  const [loading, setLoading] = useState(false)

  if (!condition) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Error resetting count:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            איפוס מונה משתתפים
          </DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך לאפס את מונה המשתתפים?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Condition Details */}
          <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
            <div>
              <span className="font-semibold">תנאי:</span>{' '}
              {condition.responseTime} + {condition.communicationStyle} +{' '}
              {condition.ageGroup}
            </div>
            <div>
              <span className="font-semibold">מונה נוכחי:</span>{' '}
              <span className="text-lg font-bold">{condition.participantCount}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">שים לב!</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>פעולה זו תאפס את המונה ל-0</li>
                  <li>
                    השפעה על load balancing - משתתפים חדשים יועברו לתנאי זה בעדיפות
                    גבוהה
                  </li>
                  <li>אין השפעה על משתתפים קיימים או נתונים מאוחסנים</li>
                  <li>מומלץ לשימוש בבדיקות או איפוס מערכת בלבד</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600">
            פעולה זו נועדה למצבי בדיקה או תחזוקה. אל תבצע איפוס במהלך מחקר פעיל
            ללא תיאום.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            ביטול
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'מאפס...' : 'אפס מונה'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
