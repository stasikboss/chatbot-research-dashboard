'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ChatContainerProps {
  children: ReactNode
  className?: string
}

export function ChatContainer({ children, className }: ChatContainerProps) {
  const [isTyping, setIsTyping] = useState(false)

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-whatsapp-bg',
        className
      )}
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-whatsapp-teal text-white p-3 shadow-lg flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span className="text-2xl">🏢</span>
          </div>
          {/* Online status indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-whatsapp-teal"></div>
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-base">שירות לקוחות</h1>
          <p className="text-xs opacity-90 flex items-center gap-1">
            {isTyping ? (
              <>
                <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                <span>מקליד...</span>
              </>
            ) : (
              <>
                <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span>מקוון</span>
              </>
            )}
          </p>
        </div>
        {/* Menu dots */}
        <div className="flex flex-col gap-1">
          <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
          <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
          <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-whatsapp-bg"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1cbc1' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {children}
      </div>

      {/* Bottom padding for better UX */}
      <div className="h-2 bg-whatsapp-bg"></div>
    </div>
  )
}
