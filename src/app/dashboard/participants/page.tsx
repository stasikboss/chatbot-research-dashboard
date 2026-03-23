'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatTime, formatDuration } from '@/lib/utils'
import { ParticipantWithRelations } from '@/types'

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<ParticipantWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/dashboard/participants')
      const data = await response.json()
      setParticipants(data.participants || [])
    } catch (error) {
      console.error('Error fetching participants:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      COMPLETED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      ABANDONED: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const text = {
      COMPLETED: 'הושלם',
      IN_PROGRESS: 'בתהליך',
      ABANDONED: 'נטוש',
    }
    return text[status as keyof typeof text] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען משתתפים...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">משתתפים</h1>
        <p className="text-gray-600 mt-2">רשימת כל המשתתפים במחקר</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>סה"כ {participants.length} משתתפים</CardTitle>
          <CardDescription>לחץ על שורה לצפייה בשיחה המלאה</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מזהה</TableHead>
                <TableHead>גיל</TableHead>
                <TableHead>תנאי</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>שלב</TableHead>
                <TableHead>תאריך</TableHead>
                <TableHead>משך</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow
                  key={participant.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => window.location.href = `/dashboard/sessions/${participant.id}`}
                >
                  <TableCell className="font-mono text-xs">
                    {participant.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{participant.age}</TableCell>
                  <TableCell>{participant.conditionId}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(participant.status)}`}
                    >
                      {getStatusText(participant.status)}
                    </span>
                  </TableCell>
                  <TableCell>{participant.currentStep}/13</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(participant.createdAt)}
                    <br />
                    <span className="text-gray-500 text-xs">
                      {formatTime(participant.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {participant.result?.totalDurationSeconds
                      ? formatDuration(participant.result.totalDurationSeconds)
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
