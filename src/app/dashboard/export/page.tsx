'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExportPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExport = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/export')

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chatbot-research-data-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export error:', err)
      setError('שגיאה בייצוא הנתונים')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ייצוא נתונים</h1>
        <p className="text-gray-600 mt-2">ייצא את כל נתוני המחקר לקובץ Excel</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>ייצוא ל-Excel</CardTitle>
          <CardDescription>
            הקובץ יכלול 3 גיליונות: משתתפים, הודעות וסיכום לפי תנאי
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2">מה כלול בייצוא:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>
                  <strong>גיליון משתתפים:</strong> כל פרטי המשתתפים, תנאים, סטטוסים ותוצאות
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>
                  <strong>גיליון הודעות:</strong> כל ההודעות עם timestamps ושלבים
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>
                  <strong>גיליון סיכום:</strong> סטטיסטיקות מצרפיות לכל 12 התנאים
                </span>
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                מייצא נתונים...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                ייצא נתונים ל-Excel
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
