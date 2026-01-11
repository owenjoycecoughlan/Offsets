import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NodeStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentId, authorName, content } = body

    // Validation
    if (!authorName || !content) {
      return NextResponse.json(
        { error: 'Author name and content are required' },
        { status: 400 }
      )
    }

    if (typeof authorName !== 'string' || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // If parentId is provided, verify it exists and is live
    if (parentId) {
      const parentNode = await prisma.node.findUnique({
        where: { id: parentId },
      })

      if (!parentNode) {
        return NextResponse.json(
          { error: 'Parent node not found' },
          { status: 404 }
        )
      }

      if (parentNode.status !== NodeStatus.LIVE) {
        return NextResponse.json(
          { error: 'Cannot respond to a node that is not live' },
          { status: 400 }
        )
      }
    }

    // Create the node
    const node = await prisma.node.create({
      data: {
        authorName: authorName.trim(),
        content: content.trim(),
        parentId: parentId || null,
        status: NodeStatus.PENDING,
      },
    })

    return NextResponse.json({ node }, { status: 201 })
  } catch (error) {
    console.error('Error creating node:', error)
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    )
  }
}
