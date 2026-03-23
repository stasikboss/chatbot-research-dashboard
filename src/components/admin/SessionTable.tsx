'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

interface LoginSession {
  id: string
  loginTime: Date
  logoutTime: Date | null
  isActive: boolean
  ipAddress: string | null
  deviceInfo: string | null
  durationSeconds: number | null
  researcher: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface SessionTableProps {
  sessions: LoginSession[]
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}ש ${minutes}ד`
  } else if (minutes > 0) {
    return `${minutes}ד ${secs}ש`
  } else {
    return `${secs}ש`
  }
}

export function SessionTable({ sessions }: SessionTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <p className="text-sm text-gray-500">אין התחברויות להצגה</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">חוקר</TableHead>
            <TableHead className="text-right">זמן כניסה</TableHead>
            <TableHead className="text-right">זמן יציאה</TableHead>
            <TableHead className="text-right">משך זמן</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
            <TableHead className="text-right">מכשיר</TableHead>
            <TableHead className="text-right">IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{session.researcher.name}</p>
                  <p className="text-xs text-gray-500">
                    {session.researcher.email}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                <div>
                  <p>
                    {new Date(session.loginTime).toLocaleDateString('he-IL')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.loginTime).toLocaleTimeString('he-IL')}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {session.logoutTime ? (
                  <div>
                    <p>
                      {new Date(session.logoutTime).toLocaleDateString('he-IL')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.logoutTime).toLocaleTimeString('he-IL')}
                    </p>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-gray-600">
                {session.durationSeconds !== null ? (
                  formatDuration(session.durationSeconds)
                ) : session.isActive ? (
                  <span className="text-green-600">פעיל</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={session.isActive ? 'success' : 'secondary'}>
                  {session.isActive ? 'פעיל' : 'הסתיים'}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                {session.deviceInfo || '-'}
              </TableCell>
              <TableCell className="text-gray-600 text-xs font-mono">
                {session.ipAddress || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
