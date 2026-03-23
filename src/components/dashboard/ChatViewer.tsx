'use client'

import React from 'react'
import { Message, Sender } from '@/types'
import { formatTime, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChatViewerProps {
  messages: Message[]
  participantId: string
}

export function ChatViewer({ messages, participantId }: ChatViewerProps) {
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>היסטוריית שיחה</CardTitle>
        <p className="text-sm text-muted-foreground">משתתף: {participantId}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto" dir="rtl">
          {sortedMessages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">אין הודעות</p>
          ) : (
            sortedMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === Sender.USER ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === Sender.USER
                      ? 'bg-green-100 rounded-br-none'
                      : 'bg-gray-100 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-xs font-semibold">
                      {message.sender === Sender.USER ? 'משתתף' : 'בוט'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      שלב {message.stepNumber}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(message.timestamp)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
