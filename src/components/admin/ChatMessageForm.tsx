'use client'

import { useState } from 'react'
import { MessageSender } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ChatMessage {
  id?: number
  stepNumber: number
  messageKey: string
  sender: MessageSender
  isFixed: boolean
  formalContent?: string | null
  friendlyContent?: string | null
  fixedContent?: string | null
  description?: string | null
  isActive: boolean
  order: number
}

interface ChatMessageFormProps {
  initialData?: ChatMessage
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export function ChatMessageForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: ChatMessageFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    stepNumber: initialData?.stepNumber || 1,
    messageKey: initialData?.messageKey || '',
    sender: initialData?.sender || MessageSender.BOT,
    isFixed: initialData?.isFixed || false,
    formalContent: initialData?.formalContent || '',
    friendlyContent: initialData?.friendlyContent || '',
    fixedContent: initialData?.fixedContent || '',
    description: initialData?.description || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    order: initialData?.order || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">פרטי ההודעה</h3>

        <div className="space-y-4">
          {/* Step Number */}
          <div>
            <label className="block text-sm font-medium mb-2">
              מספר שלב <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.stepNumber}
              onChange={(e) =>
                handleInputChange('stepNumber', parseInt(e.target.value))
              }
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            />
          </div>

          {/* Message Key */}
          <div>
            <label className="block text-sm font-medium mb-2">
              מפתח הודעה (Message Key) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.messageKey}
              onChange={(e) => handleInputChange('messageKey', e.target.value)}
              required
              disabled={isEdit}
              placeholder="לדוגמה: userOpening, initialResponse"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:opacity-50"
            />
            {isEdit && (
              <p className="text-xs text-gray-500 mt-1">
                לא ניתן לשנות מפתח הודעה קיים
              </p>
            )}
          </div>

          {/* Sender */}
          <div>
            <label className="block text-sm font-medium mb-2">
              שולח <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sender}
              onChange={(e) =>
                handleInputChange('sender', e.target.value as MessageSender)
              }
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            >
              <option value={MessageSender.BOT}>בוט</option>
              <option value={MessageSender.USER}>משתמש</option>
              <option value={MessageSender.SYSTEM}>מערכת</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">תיאור (לצורך ניהול)</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="תיאור קצר של ההודעה לצורך ניהול..."
              rows={2}
              dir="rtl"
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium mb-2">
              סדר (בתוך אותו שלב)
            </label>
            <input
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) =>
                handleInputChange('order', parseInt(e.target.value))
              }
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              הודעה פעילה
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">תוכן ההודעה</h3>

        <div className="space-y-4">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              סוג התוכן <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={formData.isFixed}
                  onChange={() => handleInputChange('isFixed', true)}
                  className="h-4 w-4"
                />
                <span className="text-sm">תוכן קבוע (ללא וריאציות)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!formData.isFixed}
                  onChange={() => handleInputChange('isFixed', false)}
                  className="h-4 w-4"
                />
                <span className="text-sm">וריאציות סגנון (פורמלי/ידידותי)</span>
              </label>
            </div>
          </div>

          {/* Fixed Content */}
          {formData.isFixed && (
            <div>
              <label className="block text-sm font-medium mb-2">
                תוכן קבוע <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.fixedContent}
                onChange={(e) =>
                  handleInputChange('fixedContent', e.target.value)
                }
                required={formData.isFixed}
                placeholder="הקלד את תוכן ההודעה בעברית..."
                rows={4}
                dir="rtl"
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
              />
            </div>
          )}

          {/* Style Variations */}
          {!formData.isFixed && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  תוכן פורמלי <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.formalContent}
                  onChange={(e) =>
                    handleInputChange('formalContent', e.target.value)
                  }
                  required={!formData.isFixed}
                  placeholder="גרסה פורמלית של ההודעה..."
                  rows={4}
                  dir="rtl"
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
                />
                <p className="text-xs text-gray-500 mt-1">
                  טיפ: השתמש ב-{'{months}'} כמשתנה שיוחלף בערך בפועל
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  תוכן ידידותי <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.friendlyContent}
                  onChange={(e) =>
                    handleInputChange('friendlyContent', e.target.value)
                  }
                  required={!formData.isFixed}
                  placeholder="גרסה ידידותית של ההודעה..."
                  rows={4}
                  dir="rtl"
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
                />
                <p className="text-xs text-gray-500 mt-1">
                  טיפ: השתמש ב-{'{months}'} כמשתנה שיוחלף בערך בפועל
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור הודעה'}
        </Button>
      </div>
    </form>
  )
}
