'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ResearcherForm } from '@/components/admin/ResearcherForm'
import { Role } from '@prisma/client'

interface Researcher {
  id: string
  email: string
  name: string
  role: Role
  isActive: boolean
}

export default function EditResearcherPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [researcher, setResearcher] = useState<Researcher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResearcher = async () => {
      try {
        const res = await fetch(`/api/admin/researchers/${id}`)
        if (res.ok) {
          const data = await res.json()
          setResearcher(data.researcher)
        } else {
          alert('Failed to fetch researcher')
          router.push('/dashboard/admin/researchers')
        }
      } catch (error) {
        console.error('Failed to fetch researcher:', error)
        router.push('/dashboard/admin/researchers')
      } finally {
        setLoading(false)
      }
    }

    fetchResearcher()
  }, [id, router])

  const handleSubmit = async (data: any) => {
    const res = await fetch(`/api/admin/researchers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to update researcher')
    }

    router.push('/dashboard/admin/researchers')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">טוען...</p>
      </div>
    )
  }

  if (!researcher) {
    return null
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">עריכת חוקר</h1>
        <p className="text-gray-500 mt-2">
          עדכון פרטי חוקר: {researcher.name}
        </p>
      </div>

      <ResearcherForm
        initialData={researcher}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard/admin/researchers')}
        isEdit
      />
    </div>
  )
}
