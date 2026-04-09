'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SATISFACTION_LABELS } from '@/lib/conditions'
import { cn } from '@/lib/utils'

interface SatisfactionSliderProps {
  onSubmit: (score: number) => void
  className?: string
}

export function SatisfactionSlider({ onSubmit, className }: SatisfactionSliderProps) {
  const [value, setValue] = useState<number | null>(null)

  const handleSubmit = () => {
    if (value !== null) {
      onSubmit(value)
    }
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6 mx-4', className)}>
      <div className="space-y-6">
        {/* Question text */}
        <div className="text-center text-lg font-medium text-gray-800">
          נא לדרג את שביעות רצונך מהפיצוי
        </div>

        {/* Button grid */}
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setValue(num)}
              className={cn(
                'aspect-square rounded-lg border-2 font-bold text-xl transition-all',
                'hover:border-whatsapp-teal hover:bg-whatsapp-teal/10',
                'focus:outline-none focus:ring-2 focus:ring-whatsapp-teal',
                value === num
                  ? 'border-whatsapp-teal bg-whatsapp-teal text-white'
                  : 'border-gray-300 bg-white text-gray-700'
              )}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between text-sm text-gray-600 px-1">
          <span>{SATISFACTION_LABELS.min}</span>
          <span>{SATISFACTION_LABELS.max}</span>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={value === null}
          className="w-full bg-whatsapp-teal hover:bg-whatsapp-dark-green disabled:opacity-50 disabled:cursor-not-allowed"
        >
          שלח
        </Button>
      </div>
    </div>
  )
}
