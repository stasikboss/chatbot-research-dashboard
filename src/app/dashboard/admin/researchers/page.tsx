'use client'

import { useEffect, useState } from 'react'
import { ResearcherTable } from '@/components/admin/ResearcherTable'
import { ChangePasswordModal } from '@/components/admin/ChangePasswordModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Role } from '@prisma/client'

interface Researcher {
  id: string
  email: string
  name: string
  role: Role
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
}

export default function ResearchersPage() {
  const [researchers, setResearchers] = useState<Researcher[]>([])
  const [loading, setLoading] = useState(true)
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean
    researcherId: string
    researcherName: string
  }>({
    isOpen: false,
    researcherId: '',
    researcherName: '',
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    researcherId: string
    researcherName: string
  }>({
    isOpen: false,
    researcherId: '',
    researcherName: '',
  })

  useEffect(() => {
    fetchResearchers()
  }, [])

  const fetchResearchers = async () => {
    try {
      const res = await fetch('/api/admin/researchers')
      if (res.ok) {
        const data = await res.json()
        setResearchers(data.researchers)
      }
    } catch (error) {
      console.error('Failed to fetch researchers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `/api/admin/researchers/${deleteModal.researcherId}`,
        {
          method: 'DELETE',
        }
      )

      if (res.ok) {
        setDeleteModal({ isOpen: false, researcherId: '', researcherName: '' })
        fetchResearchers()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete researcher')
      }
    } catch (error) {
      console.error('Failed to delete researcher:', error)
      alert('Failed to delete researcher')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">טוען...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ניהול חוקרים</h1>
        <p className="text-gray-500 mt-2">
          צפייה, הוספה ועריכת חוקרים במערכת
        </p>
      </div>

      <ResearcherTable
        researchers={researchers}
        onDelete={(id) => {
          const researcher = researchers.find((r) => r.id === id)
          if (researcher) {
            setDeleteModal({
              isOpen: true,
              researcherId: id,
              researcherName: researcher.name,
            })
          }
        }}
        onPasswordChange={(id) => {
          const researcher = researchers.find((r) => r.id === id)
          if (researcher) {
            setPasswordModal({
              isOpen: true,
              researcherId: id,
              researcherName: researcher.name,
            })
          }
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() =>
          setPasswordModal({ isOpen: false, researcherId: '', researcherName: '' })
        }
        researcherId={passwordModal.researcherId}
        researcherName={passwordModal.researcherName}
        onSuccess={() => {
          alert('הסיסמה שונתה בהצלחה')
        }}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModal.isOpen}
        onOpenChange={() =>
          setDeleteModal({ isOpen: false, researcherId: '', researcherName: '' })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת חוקר</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך למחוק את {deleteModal.researcherName}?
              <br />
              פעולה זו תמחק גם את כל ההיסטוריה והפעילות הקשורים לחוקר זה.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeleteModal({
                  isOpen: false,
                  researcherId: '',
                  researcherName: '',
                })
              }
            >
              ביטול
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
