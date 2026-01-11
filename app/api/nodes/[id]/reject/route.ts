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

    // Reject the node
    const updatedNode = await prisma.node.update({
      where: { id },
      data: {
        status: NodeStatus.REJECTED,
      },
    })

    return NextResponse.json({ node: updatedNode })
  } catch (error) {
    console.error('Error rejecting node:', error)
    return NextResponse.json(
      { error: 'Failed to reject node' },
      { status: 500 }
    )
  }
}
