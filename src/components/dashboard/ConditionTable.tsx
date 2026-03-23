'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConditionStats } from '@/types'
import { formatDuration } from '@/lib/utils'

interface ConditionTableProps {
  stats: ConditionStats[]
}

const getResponseTimeLabel = (responseTime: string) => {
  switch (responseTime) {
    case 'IMMEDIATE':
      return 'מיידי'
    case 'DELAY_WITH_MESSAGE':
      return 'עיכוב עם הודעה'
    case 'DELAY_NO_MESSAGE':
      return 'עיכוב ללא הודעה'
    default:
      return responseTime
  }
}

const getCommStyleLabel = (style: string) => {
  return style === 'FORMAL' ? 'פורמלי' : 'ידידותי'
}

const getAgeGroupLabel = (ageGroup: string) => {
  return ageGroup === 'YOUNG' ? 'צעירים (18-30)' : 'מבוגרים (50+)'
}

export function ConditionTable({ stats }: ConditionTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>פירוט לפי תנאי</CardTitle>
        <CardDescription>12 שילובי תנאים (3 × 2 × 2)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>תנאי</TableHead>
              <TableHead>זמן תגובה</TableHead>
              <TableHead>סגנון</TableHead>
              <TableHead>קבוצת גיל</TableHead>
              <TableHead>משתתפים</TableHead>
              <TableHead>הושלמו</TableHead>
              <TableHead>ממוצע זמן</TableHead>
              <TableHead>ממוצע שביעות רצון</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.condition.id}>
                <TableCell className="font-medium">{stat.condition.id}</TableCell>
                <TableCell>{getResponseTimeLabel(stat.condition.responseTime)}</TableCell>
                <TableCell>{getCommStyleLabel(stat.condition.communicationStyle)}</TableCell>
                <TableCell>{getAgeGroupLabel(stat.condition.ageGroup)}</TableCell>
                <TableCell>{stat.participantCount}</TableCell>
                <TableCell>
                  {stat.completedCount}
                  {stat.participantCount > 0 && (
                    <span className="text-xs text-muted-foreground mr-1">
                      ({Math.round((stat.completedCount / stat.participantCount) * 100)}%)
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {stat.averageDuration > 0 ? formatDuration(stat.averageDuration) : '-'}
                </TableCell>
                <TableCell>
                  {stat.averageSatisfaction > 0
                    ? stat.averageSatisfaction.toFixed(1)
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
