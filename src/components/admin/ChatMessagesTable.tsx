'use client'

import { useState } from 'react'
import { MessageSender } from '@prisma/client'
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
import { Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  id: number
  stepNumber: number
  messageKey: string
  sender: MessageSender
  isFixed: boolean
  formalContent: string | null
  friendlyContent: string | null
  fixedContent: string | null
  description: string | null
  isActive: boolean
  order: number
}

interface ChatMessagesTableProps {
  messages: ChatMessage[]
  onDelete: (id: number) => void
  onPreview?: () => void
}

export function ChatMessagesTable({
  messages,
  onDelete,
  onPreview,
}: ChatMessagesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStep, setFilterStep] = useState<string>('')
  const [filterSender, setFilterSender] = useState<string>('')

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.messageKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.formalContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.friendlyContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.fixedContent?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStep = filterStep === '' || msg.stepNumber.toString() === filterStep

    const matchesSender = filterSender === '' || msg.sender === filterSender

    return matchesSearch && matchesStep && matchesSender
  })

  const truncateText = (text: string | null, maxLength: number = 50): string => {
    if (!text) return '-'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getSenderBadgeVariant = (sender: MessageSender) => {
    switch (sender) {
      case MessageSender.BOT:
        return 'default'
      case MessageSender.USER:
        return 'secondary'
      case MessageSender.SYSTEM:
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="חיפוש לפי מפתח או תוכן..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex h-10 flex-1 min-w-[200px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
        />

        <select
          value={filterStep}
          onChange={(e) => setFilterStep(e.target.value)}
          className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
        >
          <option value="">כל השלבים</option>
          {[...new Set(messages.map((m) => m.stepNumber))]
            .sort((a, b) => a - b)
            .map((step) => (
              <option key={step} value={step}>
                שלב {step}
              </option>
            ))}
        </select>

        <select
          value={filterSender}
          onChange={(e) => setFilterSender(e.target.value)}
          className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
        >
          <option value="">כל השולחים</option>
          <option value={MessageSender.BOT}>בוט</option>
          <option value={MessageSender.USER}>משתמש</option>
          <option value={MessageSender.SYSTEM}>מערכת</option>
        </select>

        {onPreview && (
          <Button onClick={onPreview} variant="outline">
            <Eye className="ml-2 h-4 w-4" />
            תצוגה מקדימה
          </Button>
        )}

        <Link href="/dashboard/admin/chat-messages/new">
          <Button>הוסף הודעה חדשה</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שלב</TableHead>
              <TableHead className="text-right">מפתח</TableHead>
              <TableHead className="text-right">שולח</TableHead>
              <TableHead className="text-right">תוכן (preview)</TableHead>
              <TableHead className="text-right">סוג</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  לא נמצאו הודעות
                </TableCell>
              </TableRow>
            ) : (
              filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.stepNumber}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {message.messageKey}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSenderBadgeVariant(message.sender)}>
                      {message.sender === MessageSender.BOT && 'בוט'}
                      {message.sender === MessageSender.USER && 'משתמש'}
                      {message.sender === MessageSender.SYSTEM && 'מערכת'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs text-gray-600" dir="rtl">
                    {message.isFixed
                      ? truncateText(message.fixedContent)
                      : truncateText(message.formalContent) ||
                        truncateText(message.friendlyContent)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={message.isFixed ? 'outline' : 'secondary'}>
                      {message.isFixed ? 'קבועה' : 'וריאציות'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {message.isActive ? (
                      <Badge variant="default" className="bg-green-600">
                        פעיל
                      </Badge>
                    ) : (
                      <Badge variant="secondary">לא פעיל</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/admin/chat-messages/${message.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(message.id)}
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
        מציג {filteredMessages.length} מתוך {messages.length} הודעות
      </div>
    </div>
  )
}
