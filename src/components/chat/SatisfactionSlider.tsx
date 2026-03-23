'use client'

import React, { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { SATISFACTION_LABELS } from '@/lib/conditions'
import { cn } from '@/lib/utils'

interface SatisfactionSliderProps {
  onSubmit: (score: number) => void
  className?: string
}

export function SatisfactionSlider({ onSubmit, className }: SatisfactionSliderProps) {
  const [value, setValue] = useState([4]) // Default to middle (4 out of 7)

  const handleSubmit = () => {
    onSubmit(value[0])
  }

  return (
    <div className={cn('bg-white rounded-lg shadow-md p-6 mx-4', className)}>
      <div className="space-y-6">
        {/* Slider */}
        <div className="space-y-4">
          <Slider
            value={value}
            onValueChange={setValue}
            min={1}
            max={7}
            step={1}
            className="w-full"
          />

          {/* Value display */}
          <div className="flex justify-center">
            <div className="text-3xl font-bold text-whatsapp-teal">
              {value[0]}
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-gray-600">
            <span>{SATISFACTION_LABELS.min}</span>
            <span>{SATISFACTION_LABELS.max}</span>
          </div>

          {/* Scale numbers */}
          <div className="flex justify-between text-xs text-gray-400 px-1">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <span key={num}>{num}</span>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-whatsapp-teal hover:bg-whatsapp-dark-green"
        >
          שלח
        </Button>
      </div>
    </div>
  )
}
