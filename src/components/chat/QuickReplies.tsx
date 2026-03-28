'use client'

import React, { useState, useEffect } from 'react'
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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={cn('flex flex-col gap-2 items-end px-4 py-2', className)}>
      {replies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onSelect(reply.value)}
          className={cn(
            'px-4 py-2.5 rounded-full border-2 border-whatsapp-teal bg-white text-whatsapp-teal font-medium shadow-md hover:bg-whatsapp-teal hover:text-white transition-all duration-200 active:scale-95',
            'transform transition-all duration-300 ease-out',
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          )}
          style={{
            transitionDelay: `${index * 100}ms`,
          }}
        >
          {reply.text}
        </button>
      ))}
    </div>
  )
}
