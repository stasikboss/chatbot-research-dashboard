'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessageForm } from '@/components/admin/ChatMessageForm'
import { Card } from '@/components/ui/card'
import { ArrowRight, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditChatMessagePage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [message, setMessage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMessage()
  }, [params.id])

  const loadMessage = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/chat-messages/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to load message')
      }
      const data = await response.json()
      setMessage(data.message)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/admin/chat-messages/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update message')
      }

      // Success - redirect to list
      router.push('/dashboard/admin/chat-messages')
    } catch (error: any) {
      alert(`שגיאה בעדכון הודעה: ${error.message}`)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/admin/chat-messages')
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">טוען...</div>
      </div>
    )
  }

  if (error || !message) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">
          שגיאה: {error || 'הודעה לא נמצאה'}
        </div>
        <div className="text-center mt-4">
          <Link href="/dashboard/admin/chat-messages">
            <Button variant="outline">חזרה לרשימה</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header with Back Button */}
      <div>
        <Link href="/dashboard/admin/chat-messages">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לרשימת הודעות
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="h-8 w-8" />
          <h1 className="text-3xl font-bold">עריכת הודעה</h1>
        </div>
        <p className="text-gray-600">
          ערוך הודעה קיימת בתזרים השיחה - ID: {params.id}
        </p>
      </div>

      {/* Form */}
      <ChatMessageForm
        initialData={message}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={true}
      />
    </div>
  )
}
