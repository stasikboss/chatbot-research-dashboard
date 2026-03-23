'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuickReply {
  text: string
  value: any
}

interface QuickRepliesProps {
  replies: QuickReply[]
  onSelect: (value: any) => void
  className?: string
}

export function QuickReplies({ replies, onSelect, className }: QuickRepliesProps) {
  return (
    <div className={cn('flex flex-col gap-2 items-end px-4 py-2', className)}>
      {replies.map((reply, index) => (
        <Button
          key={index}
          onClick={() => onSelect(reply.value)}
          variant="outline"
          className="bg-white hover:bg-gray-50 text-whatsapp-teal border-whatsapp-teal shadow-sm"
        >
          {reply.text}
        </Button>
      ))}
    </div>
  )
}
