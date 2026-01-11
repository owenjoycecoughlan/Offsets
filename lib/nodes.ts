import { prisma } from './prisma'
import { NodeStatus } from '@prisma/client'

const DAYS_UNTIL_WITHERED = 3

/**
 * Get all live nodes (published and can receive responses)
 */
export async function getLiveNodes() {
  return await prisma.node.findMany({
    where: {
      status: NodeStatus.LIVE,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      _count: {
        select: { children: true },
      },
    },
  })
}

/**
 * Get a node by ID with its parent and children
 */
export async function getNodeWithContext(id: string) {
  return await prisma.node.findUnique({
    where: { id },
    include: {
      parent: true,
      children: {
        where: {
          status: {
            in: [NodeStatus.LIVE, NodeStatus.WITHERED],
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
      },
    },
  })
}

/**
 * Get the full ancestry chain for a node (back to root)
 */
export async function getNodeAncestry(id: string): Promise<any[]> {
  const node = await prisma.node.findUnique({
    where: { id },
    include: { parent: true },
  })

  if (!node) return []
  if (!node.parent) return [node]

  const ancestors = await getNodeAncestry(node.parent.id)
  return [...ancestors, node]
}

/**
 * Get all pending nodes (awaiting approval)
 */
export async function getPendingNodes() {
  return await prisma.node.findMany({
    where: {
      status: NodeStatus.PENDING,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      parent: true,
    },
  })
}

/**
 * Calculate days since last response for a node
 */
export function daysSinceLastResponse(node: {
  publishedAt: Date | null
  lastResponseAt: Date | null
}): number | null {
  if (!node.publishedAt) return null

  const referenceDate = node.lastResponseAt || node.publishedAt
  const now = new Date()
  const diffMs = now.getTime() - referenceDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  return Math.floor(diffDays)
}

/**
 * Check if a node should wither
 */
export function shouldNodeWither(node: {
  publishedAt: Date | null
  lastResponseAt: Date | null
  status: NodeStatus
}): boolean {
  if (node.status !== NodeStatus.LIVE) return false

  const days = daysSinceLastResponse(node)
  return days !== null && days >= DAYS_UNTIL_WITHERED
}

/**
 * Process withering for all eligible nodes
 */
export async function processWithering() {
  const liveNodes = await prisma.node.findMany({
    where: {
      status: NodeStatus.LIVE,
    },
  })

  const nodesToWither = liveNodes.filter(shouldNodeWither)

  if (nodesToWither.length > 0) {
    await prisma.node.updateMany({
      where: {
        id: {
          in: nodesToWither.map(n => n.id),
        },
      },
      data: {
        status: NodeStatus.WITHERED,
        witheredAt: new Date(),
      },
    })
  }

  return nodesToWither.length
}
