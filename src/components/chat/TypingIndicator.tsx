'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex justify-start', className)}>
      <div className="bg-white rounded-lg rounded-bl-none px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 ml-2">מקליד</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
