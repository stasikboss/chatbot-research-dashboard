import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const participants = await prisma.participant.findMany({
      include: {
        condition: true,
        messages: {
          orderBy: { timestamp: 'asc' },
        },
        result: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ participants })
  } catch (error) {
    console.error('Error fetching participants for dashboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
