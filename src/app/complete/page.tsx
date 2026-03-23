'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CompletePage() {
  useEffect(() => {
    // Clear localStorage
    localStorage.removeItem('participantId')
    localStorage.removeItem('conditionId')
    localStorage.removeItem('condition')
    localStorage.removeItem('startTime')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl text-green-700">תודה רבה!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-lg text-gray-700">
            השתתפותך במחקר הושלמה בהצלחה.
          </p>

          <div className="bg-white p-6 rounded-lg shadow-sm space-y-3">
            <p className="text-gray-600">
              התשובות שלך נשמרו והן יסייעו לנו להבין טוב יותר את חוויית המשתמש בשירות לקוחות דיגיטלי.
            </p>
            <p className="text-gray-600">
              המידע שסיפקת הינו אנונימי ומוגן ומשמש למטרות מחקר בלבד.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500">
              ניתן לסגור חלון זה.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
