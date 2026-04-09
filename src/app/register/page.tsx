'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrCreateFingerprint } from '@/lib/fingerprint'

const ageGroups = ['18-30', '31-40', '41-50', '51-60', '61-70', 'מעל 70']
const genders = ['זכר', 'נקבה', 'אחר']

export default function RegisterPage() {
  const router = useRouter()
  const [ageGroup, setAgeGroup] = useState<string>('')
  const [gender, setGender] = useState<string>('')
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

    // Validate age group
    if (!ageGroup) {
      setError('נא לבחור קבוצת גיל')
      return
    }

    // Validate gender
    if (!gender) {
      setError('נא לבחור מגדר')
      return
    }

    // Convert age group to representative age for database
    let age: number
    switch (ageGroup) {
      case '18-30':
        age = 25
        break
      case '31-40':
        age = 35
        break
      case '41-50':
        age = 45
        break
      case '51-60':
        age = 55
        break
      case '61-70':
        age = 65
        break
      case 'מעל 70':
        age = 75
        break
      default:
        age = 25
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
          age,
          ageGroup,
          gender,
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
      localStorage.setItem('participantToken', data.participantToken)
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Age Group Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium block">
                מה קבוצת הגיל שלך?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ageGroups.map((group) => (
                  <label
                    key={group}
                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      ageGroup === group ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ageGroup"
                      value={group}
                      checked={ageGroup === group}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-base font-medium">{group}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium block">
                מה המגדר שלך?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {genders.map((g) => (
                  <label
                    key={g}
                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      gender === g ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-base font-medium">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            {adminMode && (
              <div className="bg-purple-50 border-2 border-purple-500 text-purple-900 px-4 py-3 rounded text-sm font-semibold">
                🔧 מצב בדיקות פעיל
                <div className="text-xs font-normal mt-1">
                  • ניתן לבצע את המבחן מספר פעמים<br/>
                  • לא ייספר בסטטיסטיקות המחקר
                </div>
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
              <div className="mt-3 pt-3 border-t border-blue-300 text-xs text-gray-600">
                💡 טיפ לחוקרים: החזק Shift + לחץ על "התחל שיחה" למצב בדיקות
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !ageGroup || !gender}
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
