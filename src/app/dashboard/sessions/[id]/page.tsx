'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChatViewer } from '@/components/dashboard/ChatViewer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ParticipantWithRelations } from '@/types'
import { formatDate, formatTime, formatDuration } from '@/lib/utils'

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const [participant, setParticipant] = useState<ParticipantWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSession()
    }
  }, [params.id])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/participants?participantId=${params.id}`)
      const data = await response.json()
      setParticipant(data)
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען שיחה...</p>
        </div>
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">שיחה לא נמצאה</p>
        <Button onClick={() => router.push('/dashboard/participants')} className="mt-4">
          חזור לרשימת משתתפים
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">פרטי שיחה</h1>
          <p className="text-gray-600 mt-2">משתתף {participant.id}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/participants')}
        >
          חזור
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>פרטי משתתף</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">גיל:</span>
              <span className="font-medium">{participant.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">תנאי:</span>
              <span className="font-medium">#{participant.conditionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">סטטוס:</span>
              <span className="font-medium">{participant.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">שלב נוכחי:</span>
              <span className="font-medium">{participant.currentStep}/13</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">תאריך:</span>
              <span className="font-medium text-sm">
                {formatDate(participant.createdAt)} {formatTime(participant.createdAt)}
              </span>
            </div>
            {participant.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">הושלם:</span>
                <span className="font-medium text-sm">
                  {formatDate(participant.completedAt)} {formatTime(participant.completedAt)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>תוצאות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {participant.result ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">משך כולל:</span>
                  <span className="font-medium">
                    {formatDuration(participant.result.totalDurationSeconds)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">שביעות רצון:</span>
                  <span className="font-medium">
                    {participant.result.satisfactionScore || '-'}/7
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">השתתף במו"מ:</span>
                  <span className="font-medium">
                    {participant.result.participatedNegotiation ? 'כן' : 'לא'}
                  </span>
                </div>
                {participant.result.initialOffer && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">הצעה ראשונית:</span>
                    <span className="font-medium">
                      {participant.result.initialOffer} חודשים
                    </span>
                  </div>
                )}
                {participant.result.acceptedCounterOffer !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">קיבל הצעת נגד:</span>
                    <span className="font-medium">
                      {participant.result.acceptedCounterOffer ? 'כן' : 'לא'}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">אין תוצאות עדיין</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ChatViewer
        messages={participant.messages}
        participantId={participant.id}
      />
    </div>
  )
}
