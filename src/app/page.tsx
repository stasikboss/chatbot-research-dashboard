'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConsentPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const handleContinue = () => {
    if (agreed) {
      router.push('/register')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">הסכמה מדעת להשתתפות במחקר</CardTitle>
          <CardDescription>מחקר אקדמי על חוויית משתמש בשירות לקוחות דיגיטלי</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none space-y-4 text-right">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-2">מטרת המחקר</h3>
              <p>בחינת חוויית משתמש בשירות לקוחות דיגיטלי</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-lg mb-2">מהלך המחקר</h3>
              <p>
                במסגרת המחקר תתבקש/י לנהל שיחה עם מערכת שירות לקוחות בנושא תקלת אינטרנט.
                השיחה אורכת כ-5 דקות.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-lg mb-2">פרטיות</h3>
              <p>
                המחקר אנונימי לחלוטין. <strong>לא נאסף שם, טלפון או כתובת מייל.</strong>
                <br />
                המידע שנאסף משמש למטרות מחקר בלבד.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-lg mb-2">התנדבות</h3>
              <p>
                השתתפותך במחקר הינה וולונטרית ובאפשרותך להפסיק בכל עת.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                קראתי והבנתי את המידע לעיל ואני מסכים/ה להשתתף במחקר
              </span>
            </label>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleContinue}
              disabled={!agreed}
              size="lg"
              className="px-12"
            >
              המשך למחקר
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
