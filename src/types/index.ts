import {
  Participant,
  Message,
  Condition,
  Result,
  Sender,
  Status,
  ResponseTime,
  CommStyle,
  AgeGroup,
  Researcher,
  LoginSession,
  ActivityLog,
  ActivityType,
  Role,
} from '@prisma/client'

// Re-export Prisma enums
export { Sender, Status, ResponseTime, CommStyle, AgeGroup, ActivityType, Role }

// Extended types with relations
export type ParticipantWithRelations = Participant & {
  condition: Condition
  messages: Message[]
  result: Result | null
}

export type MessageWithParticipant = Message & {
  participant: Participant
}

export type ConditionWithParticipants = Condition & {
  participants: Participant[]
}

// Chat flow types
export enum ChatStep {
  OPENING = 1,
  INITIAL_RESPONSE = 2,
  DIAGNOSTIC = 3,
  USER_CONFIRM = 4,
  REGIONAL_ISSUE = 5,
  COMPENSATION = 6,
  SATISFACTION = 7,
  RESOLVED = 8,
  NEGOTIATION_OFFER = 9,
  NEGOTIATION_ASK = 10,
  COUNTER_OFFER = 11,
  FINAL_DECISION = 12,
  SECOND_COUNTER_OFFER = 13,
  SECOND_DECISION = 14,
  CLOSING = 15,
}

// Chat state
export interface ChatState {
  participantId: string
  conditionId: number
  currentStep: ChatStep
  satisfactionScore?: number
  participatedNegotiation: boolean
  initialOffer?: number
  counterOffer?: number
  secondCounterOffer?: number
  acceptedCounterOffer?: boolean
  acceptedSecondOffer?: boolean
  startTime: number
  lastActivityTime: number
}

// API request/response types
export interface CreateParticipantRequest {
  age: number
  deviceFingerprint: string
}

export interface CreateParticipantResponse {
  participantId: string
  conditionId: number
  condition: Condition
  alreadyParticipated?: boolean
  error?: string
}

export interface CreateMessageRequest {
  participantId: string
  sender: Sender
  content: string
  stepNumber: number
}

export interface CreateMessageResponse {
  success: boolean
  message?: Message
  error?: string
}

export interface GetMessagesResponse {
  messages: Message[]
  error?: string
}

export interface ExportDataResponse {
  success: boolean
  error?: string
  buffer?: Buffer
}

// Dashboard types
export interface DashboardStats {
  totalParticipants: number
  completed: number
  inProgress: number
  abandoned: number
  byCondition: ConditionStats[]
}

export interface ConditionStats {
  condition: Condition
  participantCount: number
  completedCount: number
  averageDuration: number
  averageSatisfaction: number
}

// Session storage types
export interface SessionData {
  participantId: string
  conditionId: number
  currentStep: ChatStep
  startTime: number
  lastActivityTime: number
}

// Fingerprint options
export interface FingerprintOptions {
  canvas?: boolean
  webgl?: boolean
  audio?: boolean
}

// Admin types
export type ResearcherWithStats = Researcher & {
  _count: {
    loginSessions: number
    activityLogs: number
  }
}

export type LoginSessionWithResearcher = LoginSession & {
  researcher: {
    id: string
    name: string
    email: string
    role: Role
  }
}

export type ActivityLogWithResearcher = ActivityLog & {
  researcher: {
    id: string
    name: string
    email: string
    role: Role
  }
}

export interface AdminStats {
  researchers: {
    total: number
    admins: number
    researchers: number
    active: number
    activeToday: number
  }
  participants: {
    total: number
    completed: number
    inProgress: number
    abandoned: number
  }
  activity: {
    loginsToday: number
  }
}

export interface SessionStats {
  totalSessions: number
  activeSessions: number
  todaySessions: number
  weekSessions: number
  monthSessions: number
  averageDurationSeconds: number
  activeResearchersToday: number
}
