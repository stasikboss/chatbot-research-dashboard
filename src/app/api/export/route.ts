import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { requireAuth } from '@/lib/auth-helpers'
import { logActivity } from '@/lib/activity-logger'
import { ActivityType } from '@prisma/client'
import { getClientIp } from '@/lib/ip-helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    // Fetch all data
    const participants = await prisma.participant.findMany({
      include: {
        condition: true,
        messages: {
          orderBy: { timestamp: 'asc' },
        },
        result: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const conditions = await prisma.condition.findMany({
      orderBy: { id: 'asc' },
    })

    // Create workbook
    const workbook = new ExcelJS.Workbook()

    // Sheet 1: Participants
    const participantsSheet = workbook.addWorksheet('משתתפים')
    participantsSheet.columns = [
      { header: 'מזהה', key: 'id', width: 25 },
      { header: 'גיל', key: 'age', width: 10 },
      { header: 'תנאי', key: 'conditionId', width: 10 },
      { header: 'סטטוס', key: 'status', width: 15 },
      { header: 'שלב נוכחי', key: 'currentStep', width: 12 },
      { header: 'תאריך יצירה', key: 'createdAt', width: 20 },
      { header: 'תאריך סיום', key: 'completedAt', width: 20 },
      { header: 'משך (שניות)', key: 'duration', width: 15 },
      { header: 'שביעות רצון', key: 'satisfaction', width: 15 },
      { header: 'השתתף במו"מ', key: 'participated', width: 15 },
      { header: 'הצעה ראשונית', key: 'initialOffer', width: 15 },
      { header: 'קיבל הצעה', key: 'accepted', width: 15 },
    ]

    participants.forEach((p) => {
      participantsSheet.addRow({
        id: p.id,
        age: p.age,
        conditionId: p.conditionId,
        status: p.status,
        currentStep: p.currentStep,
        createdAt: p.createdAt,
        completedAt: p.completedAt || '',
        duration: p.result?.totalDurationSeconds || '',
        satisfaction: p.result?.satisfactionScore || '',
        participated: p.result?.participatedNegotiation ? 'כן' : 'לא',
        initialOffer: p.result?.initialOffer || '',
        accepted: p.result?.acceptedCounterOffer !== null
          ? p.result.acceptedCounterOffer
            ? 'כן'
            : 'לא'
          : '',
      })
    })

    // Sheet 2: Messages
    const messagesSheet = workbook.addWorksheet('הודעות')
    messagesSheet.columns = [
      { header: 'מזהה הודעה', key: 'id', width: 25 },
      { header: 'מזהה משתתף', key: 'participantId', width: 25 },
      { header: 'שולח', key: 'sender', width: 10 },
      { header: 'תוכן', key: 'content', width: 50 },
      { header: 'שלב', key: 'stepNumber', width: 10 },
      { header: 'זמן', key: 'timestamp', width: 20 },
    ]

    participants.forEach((p) => {
      p.messages.forEach((m) => {
        messagesSheet.addRow({
          id: m.id,
          participantId: m.participantId,
          sender: m.sender,
          content: m.content,
          stepNumber: m.stepNumber,
          timestamp: m.timestamp,
        })
      })
    })

    // Sheet 3: Summary by Condition
    const summarySheet = workbook.addWorksheet('סיכום לפי תנאי')
    summarySheet.columns = [
      { header: 'תנאי', key: 'conditionId', width: 10 },
      { header: 'זמן תגובה', key: 'responseTime', width: 20 },
      { header: 'סגנון', key: 'commStyle', width: 15 },
      { header: 'קבוצת גיל', key: 'ageGroup', width: 20 },
      { header: 'סה"כ משתתפים', key: 'total', width: 15 },
      { header: 'הושלמו', key: 'completed', width: 12 },
      { header: 'בתהליך', key: 'inProgress', width: 12 },
      { header: 'נטושים', key: 'abandoned', width: 12 },
      { header: 'ממוצע זמן', key: 'avgDuration', width: 15 },
      { header: 'ממוצע שביעות רצון', key: 'avgSatisfaction', width: 20 },
    ]

    conditions.forEach((c) => {
      const conditionParticipants = participants.filter((p) => p.conditionId === c.id)
      const completed = conditionParticipants.filter((p) => p.status === 'COMPLETED')
      const inProgress = conditionParticipants.filter((p) => p.status === 'IN_PROGRESS')
      const abandoned = conditionParticipants.filter((p) => p.status === 'ABANDONED')

      const durations = completed
        .map((p) => p.result?.totalDurationSeconds)
        .filter((d): d is number => d !== null && d !== undefined)
      const avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0

      const satisfactions = completed
        .map((p) => p.result?.satisfactionScore)
        .filter((s): s is number => s !== null && s !== undefined)
      const avgSatisfaction = satisfactions.length > 0
        ? (satisfactions.reduce((a, b) => a + b, 0) / satisfactions.length).toFixed(2)
        : 0

      summarySheet.addRow({
        conditionId: c.id,
        responseTime: c.responseTime,
        commStyle: c.communicationStyle,
        ageGroup: c.ageGroup,
        total: conditionParticipants.length,
        completed: completed.length,
        inProgress: inProgress.length,
        abandoned: abandoned.length,
        avgDuration,
        avgSatisfaction,
      })
    })

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Log export activity
    await logActivity({
      researcherId: (session.user as any).id,
      action: ActivityType.EXPORT_DATA,
      description: 'ייצא נתוני מחקר לקובץ Excel',
      metadata: {
        participantCount: participants.length,
        conditionCount: conditions.length,
      },
      ipAddress: getClientIp(request) || undefined,
    })

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="chatbot-research-data-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
