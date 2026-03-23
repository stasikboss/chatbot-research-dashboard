'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, RotateCcw, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface Condition {
  id: number
  responseTime: string
  communicationStyle: string
  ageGroup: string
  participantCount: number
  stats: {
    totalParticipants: number
    completedCount: number
    inProgressCount: number
    abandonedCount: number
    completionRate: number
    averageDuration: number
    averageSatisfaction: number
  }
}

interface ConditionsTableProps {
  conditions: Condition[]
  onDelete: (id: number) => void
  onResetCount: (id: number) => void
  onViewStats: (id: number) => void
}

export function ConditionsTable({
  conditions,
  onDelete,
  onResetCount,
  onViewStats,
}: ConditionsTableProps) {
  const [filterResponseTime, setFilterResponseTime] = useState<string>('')
  const [filterCommStyle, setFilterCommStyle] = useState<string>('')
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('')

  const filteredConditions = conditions.filter((condition) => {
    const matchesResponseTime =
      filterResponseTime === '' || condition.responseTime === filterResponseTime

    const matchesCommStyle =
      filterCommStyle === '' || condition.communicationStyle === filterCommStyle

    const matchesAgeGroup =
      filterAgeGroup === '' || condition.ageGroup === filterAgeGroup

    return matchesResponseTime && matchesCommStyle && matchesAgeGroup
  })

  const getResponseTimeBadge = (responseTime: string) => {
    const variants: Record<string, string> = {
      IMMEDIATE: 'default',
      DELAY_WITH_MESSAGE: 'secondary',
      DELAY_NO_MESSAGE: 'outline',
    }
    const labels: Record<string, string> = {
      IMMEDIATE: 'מיידי',
      DELAY_WITH_MESSAGE: 'עיכוב + הודעה',
      DELAY_NO_MESSAGE: 'עיכוב ללא הודעה',
    }
    return (
      <Badge variant={variants[responseTime] as any}>
        {labels[responseTime] || responseTime}
      </Badge>
    )
  }

  const getCommStyleBadge = (commStyle: string) => {
    const variants: Record<string, string> = {
      FORMAL: 'default',
      FRIENDLY: 'secondary',
    }
    const labels: Record<string, string> = {
      FORMAL: 'פורמלי',
      FRIENDLY: 'ידידותי',
    }
    return (
      <Badge variant={variants[commStyle] as any}>
        {labels[commStyle] || commStyle}
      </Badge>
    )
  }

  const getAgeGroupBadge = (ageGroup: string) => {
    const labels: Record<string, string> = {
      YOUNG: 'צעירים (18-30)',
      OLD: 'מבוגרים (50+)',
    }
    return <Badge variant="outline">{labels[ageGroup] || ageGroup}</Badge>
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getSatisfactionColor = (score: number): string => {
    if (score >= 6) return 'text-green-600 font-semibold'
    if (score >= 4) return 'text-yellow-600 font-semibold'
    return 'text-red-600 font-semibold'
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <select
          value={filterResponseTime}
          onChange={(e) => setFilterResponseTime(e.target.value)}
          className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
        >
          <option value="">כל זמני התגובה</option>
          <option value="IMMEDIATE">מיידי</option>
          <option value="DELAY_WITH_MESSAGE">עיכוב + הודעה</option>
          <option value="DELAY_NO_MESSAGE">עיכוב ללא הודעה</option>
        </select>

        <select
          value={filterCommStyle}
          onChange={(e) => setFilterCommStyle(e.target.value)}
          className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
        >
          <option value="">כל הסגנונות</option>
          <option value="FORMAL">פורמלי</option>
          <option value="FRIENDLY">ידידותי</option>
        </select>

        <select
          value={filterAgeGroup}
          onChange={(e) => setFilterAgeGroup(e.target.value)}
          className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
        >
          <option value="">כל קבוצות הגיל</option>
          <option value="YOUNG">צעירים (18-30)</option>
          <option value="OLD">מבוגרים (50+)</option>
        </select>

        <div className="mr-auto">
          <Link href="/dashboard/admin/conditions/new">
            <Button>הוסף תנאי חדש</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">זמן תגובה</TableHead>
              <TableHead className="text-right">סגנון תקשורת</TableHead>
              <TableHead className="text-right">קבוצת גיל</TableHead>
              <TableHead className="text-right">משתתפים</TableHead>
              <TableHead className="text-right">הושלמו</TableHead>
              <TableHead className="text-right">% השלמה</TableHead>
              <TableHead className="text-right">משך ממוצע</TableHead>
              <TableHead className="text-right">שביעות רצון</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConditions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500">
                  לא נמצאו תנאים
                </TableCell>
              </TableRow>
            ) : (
              filteredConditions.map((condition) => (
                <TableRow key={condition.id}>
                  <TableCell>{getResponseTimeBadge(condition.responseTime)}</TableCell>
                  <TableCell>
                    {getCommStyleBadge(condition.communicationStyle)}
                  </TableCell>
                  <TableCell>{getAgeGroupBadge(condition.ageGroup)}</TableCell>
                  <TableCell className="font-medium">
                    {condition.participantCount}
                  </TableCell>
                  <TableCell>{condition.stats.completedCount}</TableCell>
                  <TableCell>
                    <span
                      className={
                        condition.stats.completionRate >= 80
                          ? 'text-green-600 font-semibold'
                          : condition.stats.completionRate >= 50
                          ? 'text-yellow-600 font-semibold'
                          : 'text-red-600 font-semibold'
                      }
                    >
                      {condition.stats.completionRate.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {condition.stats.averageDuration > 0
                      ? formatDuration(condition.stats.averageDuration)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {condition.stats.averageSatisfaction > 0 ? (
                      <span
                        className={getSatisfactionColor(
                          condition.stats.averageSatisfaction
                        )}
                      >
                        {condition.stats.averageSatisfaction.toFixed(1)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link href={`/dashboard/admin/conditions/${condition.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewStats(condition.id)}
                        title="צפה בסטטיסטיקות"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResetCount(condition.id)}
                        title="איפוס מונה"
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(condition.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600">
        מציג {filteredConditions.length} מתוך {conditions.length} תנאים
      </div>
    </div>
  )
}
