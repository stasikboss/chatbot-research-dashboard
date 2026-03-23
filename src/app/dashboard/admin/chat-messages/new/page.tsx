'use client'

import { useRouter } from 'next/navigation'
import { ChatMessageForm } from '@/components/admin/ChatMessageForm'
import { Card } from '@/components/ui/card'
import { ArrowRight, MessageSquarePlus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewChatMessagePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/admin/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create message')
      }

      // Success - redirect to list
      router.push('/dashboard/admin/chat-messages')
    } catch (error: any) {
      alert(`שגיאה ביצירת הודעה: ${error.message}`)
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/admin/chat-messages')
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
          <MessageSquarePlus className="h-8 w-8" />
          <h1 className="text-3xl font-bold">הוספת הודעה חדשה</h1>
        </div>
        <p className="text-gray-600">
          צור הודעה חדשה לתזרים השיחה עם המשתתפים
        </p>
      </div>

      {/* Form */}
      <ChatMessageForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEdit={false}
      />
    </div>
  )
}
