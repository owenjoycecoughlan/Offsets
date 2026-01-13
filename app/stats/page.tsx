import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { NodeStatus } from '@prisma/client'
import { getActiveIteration } from '@/lib/iterations'

async function getStatistics() {
  const activeIteration = await getActiveIteration()

  const [
    totalNodes,
    liveNodes,
    witheredNodes,
    totalAuthors,
    deepestBranch,
    mostActiveNode,
  ] = await Promise.all([
    // Total nodes (excluding pending/rejected)
    prisma.node.count({
      where: {
        status: {
          in: [NodeStatus.LIVE, NodeStatus.WITHERED],
        },
        iterationId: activeIteration.id,
      },
    }),

    // Live nodes
    prisma.node.count({
      where: {
        status: NodeStatus.LIVE,
        iterationId: activeIteration.id,
      },
    }),

    // Withered nodes
    prisma.node.count({
      where: {
        status: NodeStatus.WITHERED,
        iterationId: activeIteration.id,
      },
    }),

    // Total unique authors (from withered nodes only)
    prisma.node.findMany({
      where: {
        status: NodeStatus.WITHERED,
        iterationId: activeIteration.id,
      },
      distinct: ['authorName'],
      select: {
        authorName: true,
      },
    }).then((authors) => authors.length),

    // Find deepest branch (node with most ancestors)
    prisma.$queryRaw<Array<{ id: string; depth: number }>>`
      WITH RECURSIVE node_tree AS (
        SELECT id, "parentId", 1 as depth
        FROM "Node"
        WHERE "parentId" IS NULL AND "iterationId" = ${activeIteration.id}

        UNION ALL

        SELECT n.id, n."parentId", nt.depth + 1
        FROM "Node" n
        INNER JOIN node_tree nt ON n."parentId" = nt.id
        WHERE n."iterationId" = ${activeIteration.id}
      )
      SELECT depth
      FROM node_tree
      ORDER BY depth DESC
      LIMIT 1
    `.then((result) => result[0]?.depth || 0),

    // Most active node (most children)
    prisma.node.findFirst({
      where: {
        status: {
          in: [NodeStatus.LIVE, NodeStatus.WITHERED],
        },
        iterationId: activeIteration.id,
      },
      include: {
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: {
        children: {
          _count: 'desc',
        },
      },
    }),
  ])

  // Get root nodes count
  const rootNodes = await prisma.node.count({
    where: {
      parentId: null,
      status: {
        in: [NodeStatus.LIVE, NodeStatus.WITHERED],
      },
      iterationId: activeIteration.id,
    },
  })

  return {
    totalNodes,
    liveNodes,
    witheredNodes,
    totalAuthors,
    deepestBranch,
    rootNodes,
    mostActiveNode: mostActiveNode ? {
      id: mostActiveNode.id,
      childrenCount: mostActiveNode._count.children,
      excerpt: mostActiveNode.content.slice(0, 100),
    } : null,
  }
}

export default async function StatsPage() {
  const stats = await getStatistics()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-teal hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <header className="mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-2">Project Statistics</h1>
          <p className="text-gray-mid">
            Overview of the Offsets collaborative writing project
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 border border-gray-light" style={{ backgroundColor: '#3a3a3a' }}>
            <h3 className="text-sm font-medium text-gray-mid mb-1">Total Nodes</h3>
            <p className="text-4xl font-bold text-foreground">{stats.totalNodes}</p>
          </div>

          <div className="p-6 border border-gray-light" style={{ backgroundColor: '#3a3a3a' }}>
            <h3 className="text-sm font-medium text-gray-mid mb-1">Live Nodes</h3>
            <p className="text-4xl font-bold text-foreground">{stats.liveNodes}</p>
          </div>

          <div className="p-6 border border-gray-light" style={{ backgroundColor: '#3a3a3a' }}>
            <h3 className="text-sm font-medium text-gray-mid mb-1">Withered Nodes</h3>
            <p className="text-4xl font-bold text-foreground">{stats.witheredNodes}</p>
          </div>

          <div className="p-6 border border-gray-light" style={{ backgroundColor: '#3a3a3a' }}>
            <h3 className="text-sm font-medium text-gray-mid mb-1">Root Nodes</h3>
            <p className="text-4xl font-bold text-foreground">{stats.rootNodes}</p>
          </div>

          <div className="p-6 border border-gray-light" style={{ backgroundColor: '#3a3a3a' }}>
            <h3 className="text-sm font-medium text-gray-mid mb-1">Unique Authors</h3>
            <p className="text-4xl font-bold text-foreground">{stats.totalAuthors}</p>
            <p className="text-xs text-gray-mid mt-1">From withered nodes</p>
          </div>

          <div className="p-6 border border-gray-light" style={{ backgroundColor: '#3a3a3a' }}>
            <h3 className="text-sm font-medium text-gray-mid mb-1">Deepest Branch</h3>
            <p className="text-4xl font-bold text-foreground">{stats.deepestBranch}</p>
            <p className="text-xs text-gray-mid mt-1">Levels deep</p>
          </div>
        </div>

        {stats.mostActiveNode && (
          <div className="p-6 border border-gray-light" style={{ backgroundColor: '#3a3a3a' }}>
            <h3 className="text-lg font-medium text-foreground mb-4">Most Active Node</h3>
            <Link
              href={`/node/${stats.mostActiveNode.id}`}
              className="text-teal hover:text-foreground"
            >
              Node #{stats.mostActiveNode.id.slice(0, 8)}
            </Link>
            <p className="text-gray-mid text-sm mt-2">
              {stats.mostActiveNode.childrenCount} {stats.mostActiveNode.childrenCount === 1 ? 'response' : 'responses'}
            </p>
            <p className="text-foreground mt-3 text-sm">
              {stats.mostActiveNode.excerpt}...
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
