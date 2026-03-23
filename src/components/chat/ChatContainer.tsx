'use client'

import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChatContainerProps {
  children: ReactNode
  className?: string
}

export function ChatContainer({ children, className }: ChatContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-whatsapp-bg',
        className
      )}
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-whatsapp-teal text-white p-4 shadow-md flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <span className="text-whatsapp-teal font-bold text-lg">🏢</span>
        </div>
        <div>
          <h1 className="font-semibold text-base">שירות לקוחות</h1>
          <p className="text-xs opacity-90">מקוון</p>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-whatsapp-bg"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(209, 203, 193, 0.05),
            rgba(209, 203, 193, 0.05) 10px,
            transparent 10px,
            transparent 20px
          )`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
