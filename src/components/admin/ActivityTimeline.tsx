'use client'

import { ActivityType } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'
import {
  LogIn,
  LogOut,
  Eye,
  Users,
  FileDown,
  UserPlus,
  UserCog,
  Trash2,
  Shield,
  Key,
} from 'lucide-react'

interface Activity {
  id: string
  action: ActivityType
  description: string
  timestamp: Date
  researcher: {
    id: string
    name: string
    email: string
  }
}

interface ActivityTimelineProps {
  activities: Activity[]
}

const actionIcons: Record<ActivityType, React.ComponentType<any>> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  VIEW_DASHBOARD: Eye,
  VIEW_PARTICIPANTS: Users,
  VIEW_SESSION: Eye,
  EXPORT_DATA: FileDown,
  CREATE_RESEARCHER: UserPlus,
  UPDATE_RESEARCHER: UserCog,
  DELETE_RESEARCHER: Trash2,
  CHANGE_ROLE: Shield,
  CHANGE_PASSWORD: Key,
}

const actionColors: Record<ActivityType, string> = {
  LOGIN: 'text-green-600 bg-green-100',
  LOGOUT: 'text-gray-600 bg-gray-100',
  VIEW_DASHBOARD: 'text-blue-600 bg-blue-100',
  VIEW_PARTICIPANTS: 'text-purple-600 bg-purple-100',
  VIEW_SESSION: 'text-blue-600 bg-blue-100',
  EXPORT_DATA: 'text-orange-600 bg-orange-100',
  CREATE_RESEARCHER: 'text-green-600 bg-green-100',
  UPDATE_RESEARCHER: 'text-blue-600 bg-blue-100',
  DELETE_RESEARCHER: 'text-red-600 bg-red-100',
  CHANGE_ROLE: 'text-purple-600 bg-purple-100',
  CHANGE_PASSWORD: 'text-yellow-600 bg-yellow-100',
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-4 text-sm text-gray-500">אין פעילות אחרונה</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => {
          const Icon = actionIcons[activity.action]
          const colorClass = actionColors[activity.action]

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute right-4 top-4 -mr-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3 space-x-reverse">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 space-x-reverse pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {activity.researcher.name}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-left text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: he,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
