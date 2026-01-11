import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { NodeStatus } from '@prisma/client'

async function getStatistics() {
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
      },
    }),

    // Live nodes
    prisma.node.count({
      where: {
        status: NodeStatus.LIVE,
      },
    }),

    // Withered nodes
    prisma.node.count({
      where: {
        status: NodeStatus.WITHERED,
      },
    }),

    // Total unique authors (from withered nodes only)
    prisma.node.findMany({
      where: {
        status: NodeStatus.WITHERED,
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
        WHERE "parentId" IS NULL

        UNION ALL

        SELECT n.id, n."parentId", nt.depth + 1
        FROM "Node" n
        INNER JOIN node_tree nt ON n."parentId" = nt.id
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
          <Link href="/" className="text-purple-dark hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <header className="mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-2">Project Statistics</h1>
          <p className="text-purple-muted">
            Overview of the Offsets collaborative writing project
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
            <h3 className="text-sm font-medium text-purple-muted mb-1">Total Nodes</h3>
            <p className="text-4xl font-bold text-foreground">{stats.totalNodes}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
            <h3 className="text-sm font-medium text-purple-muted mb-1">Live Nodes</h3>
            <p className="text-4xl font-bold text-purple-dark">{stats.liveNodes}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
            <h3 className="text-sm font-medium text-purple-muted mb-1">Withered Nodes</h3>
            <p className="text-4xl font-bold text-foreground">{stats.witheredNodes}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
            <h3 className="text-sm font-medium text-purple-muted mb-1">Root Nodes</h3>
            <p className="text-4xl font-bold text-foreground">{stats.rootNodes}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
            <h3 className="text-sm font-medium text-purple-muted mb-1">Unique Authors</h3>
            <p className="text-4xl font-bold text-foreground">{stats.totalAuthors}</p>
            <p className="text-xs text-purple-muted mt-1">From withered nodes</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
            <h3 className="text-sm font-medium text-purple-muted mb-1">Deepest Branch</h3>
            <p className="text-4xl font-bold text-foreground">{stats.deepestBranch}</p>
            <p className="text-xs text-purple-muted mt-1">Levels deep</p>
          </div>
        </div>

        {stats.mostActiveNode && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
            <h3 className="text-lg font-medium text-foreground mb-4">Most Active Node</h3>
            <Link
              href={`/node/${stats.mostActiveNode.id}`}
              className="text-purple-dark hover:text-foreground"
            >
              Node #{stats.mostActiveNode.id.slice(0, 8)}
            </Link>
            <p className="text-purple-muted text-sm mt-2">
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
