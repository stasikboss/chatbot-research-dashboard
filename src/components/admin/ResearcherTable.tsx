'use client'

import { useState } from 'react'
import { Role } from '@prisma/client'
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
import { Edit, Trash2, Key } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'
import Link from 'next/link'

interface Researcher {
  id: string
  email: string
  name: string
  role: Role
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

interface ResearcherTableProps {
  researchers: Researcher[]
  onDelete: (id: string) => void
  onPasswordChange: (id: string) => void
}

export function ResearcherTable({
  researchers,
  onDelete,
  onPasswordChange,
}: ResearcherTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResearchers = researchers.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="חיפוש לפי שם או אימייל..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Link href="/dashboard/admin/researchers/new">
          <Button>הוסף חוקר חדש</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">אימייל</TableHead>
              <TableHead className="text-right">תפקיד</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">כניסה אחרונה</TableHead>
              <TableHead className="text-right">תאריך יצירה</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResearchers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  לא נמצאו חוקרים
                </TableCell>
              </TableRow>
            ) : (
              filteredResearchers.map((researcher) => (
                <TableRow key={researcher.id}>
                  <TableCell className="font-medium">
                    {researcher.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {researcher.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        researcher.role === Role.ADMIN ? 'default' : 'secondary'
                      }
                    >
                      {researcher.role === Role.ADMIN ? 'מנהל' : 'חוקר'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={researcher.isActive ? 'success' : 'destructive'}
                    >
                      {researcher.isActive ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {researcher.lastLoginAt
                      ? formatDistanceToNow(new Date(researcher.lastLoginAt), {
                          addSuffix: true,
                          locale: he,
                        })
                      : 'מעולם לא'}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(researcher.createdAt).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/admin/researchers/${researcher.id}/edit`}
                      >
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPasswordChange(researcher.id)}
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(researcher.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
