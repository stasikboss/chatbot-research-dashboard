'use client'

import { useRouter } from 'next/navigation'
import { ResearcherForm } from '@/components/admin/ResearcherForm'
import { Role } from '@prisma/client'

export default function NewResearcherPage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    const res = await fetch('/api/admin/researchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create researcher')
    }

    router.push('/dashboard/admin/researchers')
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">הוסף חוקר חדש</h1>
        <p className="text-gray-500 mt-2">יצירת חשבון חוקר חדש במערכת</p>
      </div>

      <ResearcherForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard/admin/researchers')}
      />
    </div>
  )
}
