'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConditionForm } from '@/components/admin/ConditionForm'
import { ArrowRight, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditConditionPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [condition, setCondition] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCondition()
  }, [params.id])

  const loadCondition = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/conditions/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to load condition')
      }
      const data = await response.json()
      setCondition(data.condition)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/admin/conditions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update condition')
      }

      router.push('/dashboard/admin/conditions')
    } catch (error: any) {
      alert(`שגיאה בעדכון תנאי: ${error.message}`)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/admin/conditions')
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">טוען...</div>
      </div>
    )
  }

  if (error || !condition) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">
          שגיאה: {error || 'תנאי לא נמצא'}
        </div>
        <div className="text-center mt-4">
          <Link href="/dashboard/admin/conditions">
            <Button variant="outline">חזרה לרשימה</Button>
          </Link>
        </div>
      </div>
    )
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
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">עריכת תנאי</h1>
        </div>
        <p className="text-gray-600">ערוך תנאי ניסויי קיים - ID: {params.id}</p>
      </div>

      <ConditionForm
        initialData={condition}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={true}
      />
    </div>
  )
}
