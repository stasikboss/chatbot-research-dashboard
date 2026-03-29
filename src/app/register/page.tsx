'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { validateAge } from '@/lib/utils'
import { getOrCreateFingerprint } from '@/lib/fingerprint'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [shiftHeld, setShiftHeld] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Use the shiftHeld state captured from button click
    if (shiftHeld) {
      setAdminMode(true)
      console.log('🔧 Admin mode activated - bypass duplicate participant check')
    }

    // Validate name
    if (!name.trim()) {
      setError('נא להזין שם')
      return
    }

    const ageNum = parseInt(age)
    if (isNaN(ageNum)) {
      setError('נא להזין גיל תקין')
      return
    }

    // Validate age
    const validation = validateAge(ageNum)
    if (!validation.valid) {
      setError(validation.error || 'גיל לא תקין')
      return
    }

    setLoading(true)

    try {
      // Get device fingerprint
      const fingerprint = await getOrCreateFingerprint()

      // Create participant
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          age: ageNum,
          deviceFingerprint: fingerprint,
          adminMode: shiftHeld,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.alreadyParticipated) {
          setError('כבר השתתפת בניסוי זה. תודה על ההשתתפות!')
        } else {
          setError(data.error || 'שגיאה ביצירת משתתף')
        }
        setLoading(false)
        return
      }

      // Clear old session data for admin testing
      if (shiftHeld) {
        localStorage.clear()
        console.log('🔧 Admin mode: localStorage cleared for fresh test')
      }

      // Store participant data in localStorage
      localStorage.setItem('participantId', data.participantId)
      localStorage.setItem('conditionId', data.conditionId)
      localStorage.setItem('condition', JSON.stringify(data.condition))
      localStorage.setItem('startTime', Date.now().toString())

      // Navigate to chat
      router.push('/chat')
    } catch (err) {
      console.error('Error:', err)
      setError('אירעה שגיאה. נא לנסות שוב.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">פרטי משתתף</CardTitle>
          <CardDescription>נא למלא את הפרטים הבאים להתחלת המחקר</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                מה שמך?
              </label>
              <Input
                id="name"
                type="text"
                placeholder="הזן שם מלא"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-center text-lg"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium">
                מה הגיל שלך?
              </label>
              <Input
                id="age"
                type="number"
                placeholder="הזן גיל"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
                max="120"
                required
                className="text-center text-lg"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 text-center">
                המחקר מיועד לגילאי 18+
              </p>
            </div>

            {adminMode && (
              <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded text-sm">
                🔧 מצב מנהל פעיל - ניתן לבצע את המבחן מספר פעמים
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
              <h4 className="font-semibold mb-2">הוראות:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>השיחה תימשך כ-5 דקות</li>
                <li>עקוב אחר ההוראות בשיחה</li>
                <li>השב על השאלות בצורה כנה</li>
                <li>אין תשובות נכונות או לא נכונות</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={loading || !name.trim() || !age}
              className="w-full"
              size="lg"
              onMouseDown={(e: React.MouseEvent) => {
                // Capture Shift key state when button is clicked
                setShiftHeld(e.shiftKey)
              }}
            >
              {loading ? 'טוען...' : 'התחל שיחה'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
