'use client'

import React, { useState, useEffect } from 'react'
import { Sender } from '@/types'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  sender: Sender
  content: string
  timestamp: Date | string
  className?: string
}

export function MessageBubble({ sender, content, timestamp, className }: MessageBubbleProps) {
  const isUser = sender === Sender.USER
  const time = formatTime(timestamp)
  const [isVisible, setIsVisible] = useState(false)
  const [readStatus, setReadStatus] = useState<'sent' | 'delivered' | 'read'>('sent')

  // Fade in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Progressive read status for user messages
  useEffect(() => {
    if (!isUser) return

    // Sent → Delivered after 300ms
    const deliveredTimer = setTimeout(() => {
      setReadStatus('delivered')
    }, 300)

    // Delivered → Read after 800ms
    const readTimer = setTimeout(() => {
      setReadStatus('read')
    }, 1100)

    return () => {
      clearTimeout(deliveredTimer)
      clearTimeout(readTimer)
    }
  }, [isUser])

  return (
    <div
      className={cn(
        'flex transition-all duration-300 ease-out',
        isUser ? 'justify-end' : 'justify-start',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        className
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2 shadow-md',
          isUser
            ? 'bg-whatsapp-light-green rounded-br-none'
            : 'bg-white rounded-bl-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{content}</p>
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-[10px] text-gray-500">{time}</span>
          {isUser && (
            <div className="flex items-center">
              {readStatus === 'sent' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 15"
                  width="14"
                  height="14"
                  className="text-gray-400"
                >
                  <path
                    fill="currentColor"
                    d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                  />
                </svg>
              )}
              {readStatus === 'delivered' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 15"
                  width="16"
                  height="15"
                  className="text-gray-400"
                >
                  <path
                    fill="currentColor"
                    d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                  />
                </svg>
              )}
              {readStatus === 'read' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 15"
                  width="16"
                  height="15"
                  className="text-blue-500"
                >
                  <path
                    fill="currentColor"
                    d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
