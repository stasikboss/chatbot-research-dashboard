import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const conditions = await prisma.condition.findMany({
      include: {
        _count: {
          select: { participants: true },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    return NextResponse.json({ conditions })
  } catch (error) {
    console.error('Error fetching conditions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
