'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ChatMessageDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (forceDelete: boolean) => Promise<void>
  messageId: number | null
  messageKey: string
  stepNumber: number
}

export function ChatMessageDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  messageId,
  messageKey,
  stepNumber,
}: ChatMessageDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeParticipants, setActiveParticipants] = useState<number>(0)
  const [checkingParticipants, setCheckingParticipants] = useState(false)

  useEffect(() => {
    if (isOpen && messageId) {
      checkActiveParticipants()
    }
  }, [isOpen, messageId])

  const checkActiveParticipants = async () => {
    setCheckingParticipants(true)
    try {
      // Check for active participants on this step
      const response = await fetch(
        `/api/dashboard/participants?status=IN_PROGRESS&currentStep=${stepNumber}`
      )
      if (response.ok) {
        const data = await response.json()
        setActiveParticipants(data.participants?.length || 0)
      }
    } catch (error) {
      console.error('Error checking participants:', error)
    } finally {
      setCheckingParticipants(false)
    }
  }

  const handleDelete = async (force: boolean) => {
    setLoading(true)
    try {
      await onConfirm(force)
      onClose()
    } catch (error) {
      console.error('Error deleting message:', error)
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
            מחיקת הודעה
          </DialogTitle>
          <DialogDescription>
            האם אתה בטוח שברצונך למחוק את ההודעה?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message Info */}
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <div className="text-sm">
              <span className="font-semibold">מפתח הודעה:</span>{' '}
              <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                {messageKey}
              </code>
            </div>
            <div className="text-sm">
              <span className="font-semibold">שלב:</span> {stepNumber}
            </div>
          </div>

          {/* Warning */}
          {checkingParticipants ? (
            <div className="text-sm text-gray-500">
              בודק משתתפים פעילים...
            </div>
          ) : activeParticipants > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">אזהרה!</p>
                  <p>
                    קיימים {activeParticipants} משתתפים פעילים בשלב זה כרגע.
                    מחיקת ההודעה עלולה לגרום לבעיות בשיחות הפעילות שלהם.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <div className="text-sm text-green-800">
                <p>✓ אין משתתפים פעילים בשלב זה</p>
              </div>
            </div>
          )}

          {/* Delete Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium">בחר פעולה:</p>

            {activeParticipants > 0 && (
              <Button
                variant="outline"
                onClick={() => handleDelete(false)}
                disabled={loading}
                className="w-full justify-start"
              >
                השבת הודעה (Soft Delete)
                <span className="text-xs text-gray-500 mr-auto">מומלץ</span>
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => handleDelete(true)}
              disabled={loading}
              className="w-full justify-start"
            >
              {activeParticipants > 0 ? 'מחק בכוח (Force Delete)' : 'מחק הודעה'}
              {activeParticipants > 0 && (
                <span className="text-xs opacity-80 mr-auto">מסוכן!</span>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            {activeParticipants > 0
              ? 'השבתה תסמן את ההודעה כלא פעילה מבלי למחוק אותה מהמערכת. מחיקה בכוח תמחק לצמיתות.'
              : 'פעולה זו תמחק את ההודעה לצמיתות מהמערכת.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
