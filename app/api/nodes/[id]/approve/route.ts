import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NodeStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the node
    const node = await prisma.node.findUnique({
      where: { id },
    })

    if (!node) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      )
    }

    if (node.status !== NodeStatus.PENDING) {
      return NextResponse.json(
        { error: 'Node is not pending approval' },
        { status: 400 }
      )
    }

    // Approve the node
    const updatedNode = await prisma.node.update({
      where: { id },
      data: {
        status: NodeStatus.LIVE,
        publishedAt: new Date(),
      },
    })

    // If this node has a parent, update the parent's lastResponseAt
    if (node.parentId) {
      await prisma.node.update({
        where: { id: node.parentId },
        data: {
          lastResponseAt: new Date(),
        },
      })
    }

    return NextResponse.json({ node: updatedNode })
  } catch (error) {
    console.error('Error approving node:', error)
    return NextResponse.json(
      { error: 'Failed to approve node' },
      { status: 500 }
    )
  }
}
