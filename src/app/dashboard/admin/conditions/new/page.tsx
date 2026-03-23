'use client'

import { useRouter } from 'next/navigation'
import { ConditionForm } from '@/components/admin/ConditionForm'
import { ArrowRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewConditionPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/admin/conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create condition')
      }

      router.push('/dashboard/admin/conditions')
    } catch (error: any) {
      alert(`שגיאה ביצירת תנאי: ${error.message}`)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/admin/conditions')
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <Link href="/dashboard/admin/conditions">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לרשימת תנאים
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Plus className="h-8 w-8" />
          <h1 className="text-3xl font-bold">הוספת תנאי חדש</h1>
        </div>
        <p className="text-gray-600">צור תנאי ניסויי חדש למחקר</p>
      </div>

      <ConditionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={false}
      />
    </div>
  )
}
