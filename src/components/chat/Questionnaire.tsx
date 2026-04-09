'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuestionnaireProps {
  onSubmit: (responses: QuestionnaireResponses) => void
}

interface QuestionnaireResponses {
  processSatisfaction: number
  outcomeSatisfaction: number
  futureIntention: number
  feedback: string
}

const satisfactionOptions = [
  { value: 1, label: '1 - בכלל לא מרוצה' },
  { value: 2, label: '2 - קצת לא מרוצה' },
  { value: 3, label: '3 - ניטרלי' },
  { value: 4, label: '4 - קצת מרוצה' },
  { value: 5, label: '5 - מאוד מרוצה' },
]

const intentionOptions = [
  { value: 1, label: '1 - לא מעוניין בכלל' },
  { value: 2, label: '2 - לא מעוניין' },
  { value: 3, label: '3 - ניטרלי' },
  { value: 4, label: '4 - מעוניין' },
  { value: 5, label: '5 - מאוד מעוניין' },
]

export function Questionnaire({ onSubmit }: QuestionnaireProps) {
  const [responses, setResponses] = useState<QuestionnaireResponses>({
    processSatisfaction: 0,
    outcomeSatisfaction: 0,
    futureIntention: 0,
    feedback: '',
  })

  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = () => {
    // Validate all required fields
    const newErrors: string[] = []
    if (!responses.processSatisfaction) newErrors.push('processSatisfaction')
    if (!responses.outcomeSatisfaction) newErrors.push('outcomeSatisfaction')
    if (!responses.futureIntention) newErrors.push('futureIntention')

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(responses)
  }

  const hasError = (field: string) => errors.includes(field)

  return (
    <Card className="p-6 space-y-6 bg-white" dir="rtl">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">שאלון סיום</h2>
        <p className="text-sm text-gray-600">
          תודה על השתתפותך במחקר זה. ממש לפני סיום, נבקש לענות על מספר שאלות קצרות בנוגע לחוויה שלך.
        </p>
      </div>

      <div className="space-y-6">
        {/* Question 1 */}
        <div>
          <label className="text-base font-semibold mb-3 block">
            בסולם של 1 עד 5, עד כמה היית מרוצה מתהליך המשא ומתן עם הצ'אטבוט?
          </label>
          <div className={`space-y-2 ${hasError('processSatisfaction') ? 'border-2 border-red-500 p-2 rounded' : ''}`}>
            {satisfactionOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`process-${option.value}`}
                  name="processSatisfaction"
                  value={option.value}
                  checked={responses.processSatisfaction === option.value}
                  onChange={(e) =>
                    setResponses({ ...responses, processSatisfaction: parseInt(e.target.value) })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor={`process-${option.value}`} className="cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div>
          <label className="text-base font-semibold mb-3 block">
            בסולם של 1 עד 5, עד כמה היית מרוצה מתוצאות המשא ומתן עם הצ'אטבוט?
          </label>
          <div className={`space-y-2 ${hasError('outcomeSatisfaction') ? 'border-2 border-red-500 p-2 rounded' : ''}`}>
            {satisfactionOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`outcome-${option.value}`}
                  name="outcomeSatisfaction"
                  value={option.value}
                  checked={responses.outcomeSatisfaction === option.value}
                  onChange={(e) =>
                    setResponses({ ...responses, outcomeSatisfaction: parseInt(e.target.value) })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor={`outcome-${option.value}`} className="cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 3 */}
        <div>
          <label className="text-base font-semibold mb-3 block">
            בסולם של 1 עד 5, כמה תהיה מעוניין.ת בעתיד לקיים משא ומתן עם הצ'אטבוט הזה באינטראקציות עסקיות אמיתיות?
          </label>
          <div className={`space-y-2 ${hasError('futureIntention') ? 'border-2 border-red-500 p-2 rounded' : ''}`}>
            {intentionOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`intention-${option.value}`}
                  name="futureIntention"
                  value={option.value}
                  checked={responses.futureIntention === option.value}
                  onChange={(e) =>
                    setResponses({ ...responses, futureIntention: parseInt(e.target.value) })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor={`intention-${option.value}`} className="cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Question 4 - Feedback */}
        <div>
          <label className="text-base font-semibold mb-3 block">
            נשמח מאוד לכל הערה או משוב על חווית המשא ומתן שלך עם הצ'אטבוט (אופציונלי)
          </label>
          <textarea
            value={responses.feedback}
            onChange={(e) => setResponses({ ...responses, feedback: e.target.value })}
            placeholder="הערות או משוב..."
            rows={4}
            className="w-full p-2 border rounded resize-none"
          />
        </div>
      </div>

      {errors.length > 0 && (
        <p className="text-red-500 text-sm text-center">
          נא למלא את כל השדות הנדרשים
        </p>
      )}

      <div className="flex justify-center pt-4">
        <Button onClick={handleSubmit} className="px-12">
          סיים
        </Button>
      </div>
    </Card>
  )
}
