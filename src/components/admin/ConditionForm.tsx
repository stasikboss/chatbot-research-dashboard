'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface Condition {
  id?: number
  responseTime: string
  communicationStyle: string
  ageGroup: string
  participantCount?: number
}

interface ConditionFormProps {
  initialData?: Condition
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export function ConditionForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: ConditionFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    responseTime: initialData?.responseTime || 'IMMEDIATE',
    communicationStyle: initialData?.communicationStyle || 'FORMAL',
    ageGroup: initialData?.ageGroup || 'YOUNG',
  })

  const hasParticipants =
    isEdit && initialData?.participantCount && initialData.participantCount > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      hasParticipants &&
      !confirm(
        `אזהרה: תנאי זה כולל ${initialData?.participantCount} משתתפים. שינוי התנאי עלול להשפיע על התוצאות המחקריות. להמשיך?`
      )
    ) {
      return
    }

    setLoading(true)

    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">פרטי התנאי</h3>

        {hasParticipants && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">אזהרה!</p>
                <p>
                  תנאי זה כולל {initialData?.participantCount} משתתפים משויכים.
                  שינוי הפרמטרים עלול להשפיע על תוקף המחקר.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Response Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              זמן תגובה <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.responseTime}
              onChange={(e) => handleInputChange('responseTime', e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            >
              <option value="IMMEDIATE">מיידי (IMMEDIATE)</option>
              <option value="DELAY_WITH_MESSAGE">
                עיכוב עם הודעה (DELAY_WITH_MESSAGE)
              </option>
              <option value="DELAY_NO_MESSAGE">
                עיכוב ללא הודעה (DELAY_NO_MESSAGE)
              </option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              קובע את משך ההמתנה לפני תגובת הבוט
            </p>
          </div>

          {/* Communication Style */}
          <div>
            <label className="block text-sm font-medium mb-2">
              סגנון תקשורת <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.communicationStyle}
              onChange={(e) =>
                handleInputChange('communicationStyle', e.target.value)
              }
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            >
              <option value="FORMAL">פורמלי (FORMAL)</option>
              <option value="FRIENDLY">ידידותי (FRIENDLY)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              קובע את טון ההודעות של הבוט
            </p>
          </div>

          {/* Age Group */}
          <div>
            <label className="block text-sm font-medium mb-2">
              קבוצת גיל <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.ageGroup}
              onChange={(e) => handleInputChange('ageGroup', e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            >
              <option value="YOUNG">צעירים 18-30 (YOUNG)</option>
              <option value="OLD">מבוגרים 50+ (OLD)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              קובע את קבוצת הגיל המיועדת לתנאי זה
            </p>
          </div>

          {/* Participant Count (Read-only for edit) */}
          {isEdit && initialData && (
            <div>
              <label className="block text-sm font-medium mb-2">
                מספר משתתפים (לקריאה בלבד)
              </label>
              <div className="flex h-10 w-full items-center rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700">
                {initialData.participantCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                מספר זה מתעדכן אוטומטית עם השמה של משתתפים
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Preview of Combination */}
      <Card className="p-6 bg-blue-50">
        <h3 className="text-sm font-semibold mb-3">תצוגה מקדימה של התנאי:</h3>
        <div className="flex flex-wrap gap-2">
          <div className="bg-white px-3 py-2 rounded-md border">
            <span className="text-xs text-gray-600">זמן תגובה:</span>
            <div className="font-medium">
              {formData.responseTime === 'IMMEDIATE' && 'מיידי'}
              {formData.responseTime === 'DELAY_WITH_MESSAGE' && 'עיכוב + הודעה'}
              {formData.responseTime === 'DELAY_NO_MESSAGE' && 'עיכוב ללא הודעה'}
            </div>
          </div>
          <div className="bg-white px-3 py-2 rounded-md border">
            <span className="text-xs text-gray-600">סגנון:</span>
            <div className="font-medium">
              {formData.communicationStyle === 'FORMAL' ? 'פורמלי' : 'ידידותי'}
            </div>
          </div>
          <div className="bg-white px-3 py-2 rounded-md border">
            <span className="text-xs text-gray-600">קבוצת גיל:</span>
            <div className="font-medium">
              {formData.ageGroup === 'YOUNG' ? 'צעירים (18-30)' : 'מבוגרים (50+)'}
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור תנאי'}
        </Button>
      </div>
    </form>
  )
}
