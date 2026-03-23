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

interface ConditionDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (forceDelete: boolean) => Promise<void>
  condition: {
    id: number
    responseTime: string
    communicationStyle: string
    ageGroup: string
    participantCount: number
  } | null
}

export function ConditionDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  condition,
}: ConditionDeleteModalProps) {
  const [loading, setLoading] = useState(false)

  if (!condition) return null

  const hasParticipants = condition.participantCount > 0

  const handleDelete = async (force: boolean) => {
    if (
      force &&
      !confirm(
        `אזהרה חמורה! מחיקה בכוח תמחק את כל ${condition.participantCount} המשתתפים והנתונים שלהם. פעולה זו בלתי הפיכה. להמשיך?`
      )
    ) {
      return
    }

    setLoading(true)
    try {
      await onConfirm(force)
      onClose()
    } catch (error) {
      console.error('Error deleting condition:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            מחיקת תנאי
          </DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך למחוק את התנאי?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Condition Details */}
          <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
            <div>
              <span className="font-semibold">זמן תגובה:</span>{' '}
              {condition.responseTime}
            </div>
            <div>
              <span className="font-semibold">סגנון:</span>{' '}
              {condition.communicationStyle}
            </div>
            <div>
              <span className="font-semibold">קבוצת גיל:</span> {condition.ageGroup}
            </div>
            <div>
              <span className="font-semibold">משתתפים:</span>{' '}
              <span className="text-lg font-bold text-red-600">
                {condition.participantCount}
              </span>
            </div>
          </div>

          {/* Warning */}
          {hasParticipants ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">אזהרה חמורה!</p>
                  <p>
                    תנאי זה כולל {condition.participantCount} משתתפים משויכים.
                    מחיקת התנאי תמחק גם את כל נתוני המשתתפים והתוצאות שלהם!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <div className="text-sm text-green-800">
                <p>✓ אין משתתפים משויכים לתנאי זה</p>
                <p className="mt-1">ניתן למחוק בבטחה</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {hasParticipants ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">בחר פעולה:</p>
              <Button
                variant="destructive"
                onClick={() => handleDelete(true)}
                disabled={loading}
                className="w-full"
              >
                מחק בכוח (כולל {condition.participantCount} משתתפים)
              </Button>
              <p className="text-xs text-red-600 text-center">
                פעולה זו תמחק לצמיתות את כל הנתונים!
              </p>
            </div>
          ) : (
            <Button
              variant="destructive"
              onClick={() => handleDelete(false)}
              disabled={loading}
              className="w-full"
            >
              מחק תנאי
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
