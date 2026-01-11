import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NodeStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const statusFilter = searchParams.get('status') as NodeStatus | null

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Build the where clause
    const where: any = {
      OR: [
        {
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          authorName: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    }

    // Add status filter if provided
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter
    } else {
      // By default, exclude PENDING and REJECTED nodes
      where.status = {
        in: [NodeStatus.LIVE, NodeStatus.WITHERED],
      }
    }

    const results = await prisma.node.findMany({
      where,
      include: {
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 50, // Limit results
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
