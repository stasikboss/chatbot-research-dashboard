'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MonthSelectorProps {
  onSelect: (months: number) => void
  className?: string
}

export function MonthSelector({ onSelect, className }: MonthSelectorProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = (months: number) => {
    setSelected(months)
    // Automatically submit after selection
    setTimeout(() => {
      onSelect(months)
    }, 300)
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6 mx-4', className)}>
      <div className="space-y-4">
        <p className="text-center text-sm text-gray-600 mb-4">
          בחר מספר חודשים (1-12)
        </p>

        {/* Grid of month buttons */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <Button
              key={month}
              onClick={() => handleSelect(month)}
              variant={selected === month ? 'default' : 'outline'}
              className={cn(
                'h-12 text-base font-semibold transition-all',
                selected === month
                  ? 'bg-whatsapp-teal hover:bg-whatsapp-dark-green text-white scale-105'
                  : 'hover:bg-gray-100 text-gray-700 border-gray-300'
              )}
            >
              {month}
            </Button>
          ))}
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          הקלק על מספר החודשים המבוקש
        </p>
      </div>
    </div>
  )
}
