import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NodeStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ iterationId: string }> }
) {
  try {
    const { iterationId } = await params

    // Fetch all live and withered nodes for this iteration
    const nodes = await prisma.node.findMany({
      where: {
        iterationId,
        status: {
          in: [NodeStatus.LIVE, NodeStatus.WITHERED],
        },
      },
      select: {
        id: true,
        content: true,
        authorName: true,
        status: true,
        parentId: true,
        publishedAt: true,
        witheredAt: true,
        _count: {
          select: {
            children: {
              where: {
                status: {
                  in: [NodeStatus.LIVE, NodeStatus.WITHERED],
                },
              },
            },
          },
        },
      },
      orderBy: {
        publishedAt: 'asc',
      },
    })

    // Transform data for tree visualization
    const treeData = nodes.map((node) => ({
      id: node.id,
      content: node.content,
      authorName: node.status === NodeStatus.WITHERED ? node.authorName : null,
      status: node.status,
      parentId: node.parentId,
      publishedAt: node.publishedAt?.toISOString(),
      witheredAt: node.witheredAt?.toISOString(),
      childrenCount: node._count.children,
    }))

    return NextResponse.json({ nodes: treeData })
  } catch (error) {
    console.error('Error fetching tree data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tree data' },
      { status: 500 }
    )
  }
}
