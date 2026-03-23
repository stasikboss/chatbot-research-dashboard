'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSender } from '@prisma/client'

interface PreviewMessage {
  id: number
  stepNumber: number
  messageKey: string
  sender: MessageSender
  content: string
  appliedStyle: string
  description: string | null
  order: number
}

interface ChatFlowPreviewProps {
  isOpen: boolean
  onClose: () => void
  conditions: Array<{
    id: number
    responseTime: string
    communicationStyle: string
    ageGroup: string
  }>
}

export function ChatFlowPreview({
  isOpen,
  onClose,
  conditions,
}: ChatFlowPreviewProps) {
  const [selectedConditionId, setSelectedConditionId] = useState<number>(
    conditions[0]?.id || 1
  )
  const [preview, setPreview] = useState<PreviewMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && selectedConditionId) {
      loadPreview()
    }
  }, [isOpen, selectedConditionId])

  const loadPreview = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/chat-messages/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditionId: selectedConditionId }),
      })

      if (!response.ok) {
        throw new Error('Failed to load preview')
      }

      const data = await response.json()
      setPreview(data.preview)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedCondition = conditions.find((c) => c.id === selectedConditionId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>תצוגה מקדימה של תזרים השיחה</DialogTitle>
        </DialogHeader>

        {/* Condition Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium">בחר תנאי לתצוגה מקדימה:</label>
          <select
            value={selectedConditionId}
            onChange={(e) => setSelectedConditionId(parseInt(e.target.value))}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
          >
            {conditions.map((condition) => (
              <option key={condition.id} value={condition.id}>
                {condition.responseTime} + {condition.communicationStyle} +{' '}
                {condition.ageGroup}
              </option>
            ))}
          </select>

          {selectedCondition && (
            <div className="flex gap-2">
              <Badge>{selectedCondition.responseTime}</Badge>
              <Badge variant="secondary">
                {selectedCondition.communicationStyle}
              </Badge>
              <Badge variant="outline">{selectedCondition.ageGroup}</Badge>
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto border rounded-md p-4 bg-gray-50">
          {loading && (
            <div className="text-center text-gray-500 py-8">טוען תצוגה מקדימה...</div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">
              שגיאה: {error}
            </div>
          )}

          {!loading && !error && preview.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              לא נמצאו הודעות לתצוגה מקדימה
            </div>
          )}

          {!loading && !error && preview.length > 0 && (
            <div className="space-y-4">
              {preview.map((msg, index) => (
                <div key={msg.id} className="space-y-2">
                  {/* Step Header */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold">שלב {msg.stepNumber}</span>
                    <span>•</span>
                    <span className="font-mono">{msg.messageKey}</span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      {msg.appliedStyle}
                    </Badge>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`flex ${
                      msg.sender === MessageSender.USER
                        ? 'justify-start'
                        : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-3 ${
                        msg.sender === MessageSender.USER
                          ? 'bg-gray-200 text-gray-900'
                          : msg.sender === MessageSender.BOT
                          ? 'bg-blue-600 text-white'
                          : 'bg-yellow-100 text-gray-900'
                      }`}
                      dir="rtl"
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {msg.content}
                      </div>
                      <div className="mt-2 text-xs opacity-70">
                        {msg.sender === MessageSender.BOT && 'בוט'}
                        {msg.sender === MessageSender.USER && 'משתמש'}
                        {msg.sender === MessageSender.SYSTEM && 'מערכת'}
                      </div>
                    </div>
                  </div>

                  {/* Description (if any) */}
                  {msg.description && (
                    <div className="text-xs text-gray-500 italic" dir="rtl">
                      {msg.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
          <Button onClick={loadPreview} disabled={loading}>
            רענן תצוגה מקדימה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
