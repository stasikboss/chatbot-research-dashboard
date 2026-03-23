'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatMessagesTable } from '@/components/admin/ChatMessagesTable'
import { ChatFlowPreview } from '@/components/admin/ChatFlowPreview'
import { ChatMessageDeleteModal } from '@/components/admin/ChatMessageDeleteModal'
import { Card } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function ChatMessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [conditions, setConditions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false)

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number
    messageKey: string
    stepNumber: number
  } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load messages
      const messagesResponse = await fetch('/api/admin/chat-messages')
      if (!messagesResponse.ok) throw new Error('Failed to load messages')
      const messagesData = await messagesResponse.json()
      setMessages(messagesData.messages)

      // Load conditions for preview
      const conditionsResponse = await fetch('/api/admin/conditions')
      if (!conditionsResponse.ok) throw new Error('Failed to load conditions')
      const conditionsData = await conditionsResponse.json()
      setConditions(conditionsData.conditions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    const message = messages.find((m: any) => m.id === id)
    if (message) {
      setDeleteTarget({
        id: message.id,
        messageKey: message.messageKey,
        stepNumber: message.stepNumber,
      })
      setDeleteModalOpen(true)
    }
  }

  const confirmDelete = async (forceDelete: boolean) => {
    if (!deleteTarget) return

    try {
      const response = await fetch(
        `/api/admin/chat-messages/${deleteTarget.id}?force=${forceDelete}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete message')
      }

      // Reload messages
      await loadData()
      setDeleteModalOpen(false)
      setDeleteTarget(null)
    } catch (error: any) {
      alert(`שגיאה במחיקה: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">טוען...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">שגיאה: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="h-8 w-8" />
          <h1 className="text-3xl font-bold">ניהול הודעות צ'אט</h1>
        </div>
        <p className="text-gray-600">
          נהל את כל ההודעות והשאלות בתזרים השיחה עם המשתתפים
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">סך הודעות</div>
          <div className="text-2xl font-bold">{messages.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">הודעות פעילות</div>
          <div className="text-2xl font-bold">
            {messages.filter((m: any) => m.isActive).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">הודעות בוט</div>
          <div className="text-2xl font-bold">
            {messages.filter((m: any) => m.sender === 'BOT').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">שלבים</div>
          <div className="text-2xl font-bold">
            {new Set(messages.map((m: any) => m.stepNumber)).size}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="p-6">
        <ChatMessagesTable
          messages={messages}
          onDelete={handleDelete}
          onPreview={() => setPreviewOpen(true)}
        />
      </Card>

      {/* Preview Modal */}
      <ChatFlowPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        conditions={conditions}
      />

      {/* Delete Modal */}
      {deleteTarget && (
        <ChatMessageDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setDeleteTarget(null)
          }}
          onConfirm={confirmDelete}
          messageId={deleteTarget.id}
          messageKey={deleteTarget.messageKey}
          stepNumber={deleteTarget.stepNumber}
        />
      )}
    </div>
  )
}
