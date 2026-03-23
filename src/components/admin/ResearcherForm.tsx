'use client'

import { useState } from 'react'
import { Role } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ResearcherFormData {
  name: string
  email: string
  password?: string
  role: Role
  isActive: boolean
}

interface ResearcherFormProps {
  initialData?: ResearcherFormData
  onSubmit: (data: ResearcherFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export function ResearcherForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: ResearcherFormProps) {
  const [formData, setFormData] = useState<ResearcherFormData>(
    initialData || {
      name: '',
      email: '',
      password: '',
      role: Role.RESEARCHER,
      isActive: true,
    }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'שגיאה לא ידועה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            שם מלא <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            placeholder="הזן שם מלא"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            אימייל <span className="text-red-500">*</span>
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            placeholder="example@domain.com"
          />
        </div>

        {/* Password (only for new researchers) */}
        {!isEdit && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              סיסמה <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password || ''}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required={!isEdit}
              minLength={6}
              placeholder="לפחות 6 תווים"
            />
            <p className="mt-1 text-xs text-gray-500">
              הסיסמה חייבת להכיל לפחות 6 תווים
            </p>
          </div>
        )}

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            תפקיד <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as Role })
            }
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
            required
          >
            <option value={Role.RESEARCHER}>חוקר</option>
            <option value={Role.ADMIN}>מנהל</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            מנהלים יכולים לנהל משתמשים ולצפות בכל הנתונים
          </p>
        </div>

        {/* Active Status (only for edit) */}
        {isEdit && (
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="mr-2 block text-sm text-gray-700"
            >
              חשבון פעיל
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור חוקר'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            ביטול
          </Button>
        </div>
      </form>
    </Card>
  )
}
