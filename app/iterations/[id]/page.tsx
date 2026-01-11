import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getIterationById } from '@/lib/iterations'
import { prisma } from '@/lib/prisma'
import { NodeStatus } from '@prisma/client'

export default async function IterationArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const iteration = await getIterationById(id)

  if (!iteration) {
    notFound()
  }

  // Get all nodes from this iteration
  const nodes = await prisma.node.findMany({
    where: {
      iterationId: id,
      status: {
        in: [NodeStatus.LIVE, NodeStatus.WITHERED],
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      _count: {
        select: {
          children: true,
        },
      },
    },
  })

  // Get statistics for this iteration
  const stats = {
    totalNodes: await prisma.node.count({
      where: {
        iterationId: id,
        status: {
          in: [NodeStatus.LIVE, NodeStatus.WITHERED],
        },
      },
    }),
    withered: await prisma.node.count({
      where: {
        iterationId: id,
        status: NodeStatus.WITHERED,
      },
    }),
    authors: await prisma.node.findMany({
      where: {
        iterationId: id,
        status: NodeStatus.WITHERED,
      },
      distinct: ['authorName'],
      select: { authorName: true },
    }).then(a => a.length),
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-purple-dark hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-serif text-foreground mb-2">
            {iteration.name}
            {iteration.isActive && (
              <span className="ml-3 text-base px-3 py-1 bg-purple-dark text-white rounded">
                Active
              </span>
            )}
          </h1>
          {iteration.description && (
            <p className="text-purple-muted mb-4">{iteration.description}</p>
          )}
          <div className="flex justify-between items-end">
            <div className="flex gap-6 text-sm text-purple-muted">
              <div>
                <span className="font-medium">Started:</span>{' '}
                {new Date(iteration.startDate).toLocaleDateString()}
              </div>
              {iteration.endDate && (
                <div>
                  <span className="font-medium">Ended:</span>{' '}
                  {new Date(iteration.endDate).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Link
                href={`/iterations/${id}`}
                className="text-sm px-4 py-2 bg-purple-dark text-white rounded-lg"
              >
                List View
              </Link>
              <Link
                href={`/iterations/${id}/tree`}
                className="text-sm px-4 py-2 border border-gray-light text-foreground rounded-lg hover:bg-background"
              >
                Tree View
              </Link>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-light">
            <div className="text-2xl font-bold text-foreground">{stats.totalNodes}</div>
            <div className="text-sm text-purple-muted">Total Nodes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-light">
            <div className="text-2xl font-bold text-foreground">{stats.withered}</div>
            <div className="text-sm text-purple-muted">Withered</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-gray-light">
            <div className="text-2xl font-bold text-foreground">{stats.authors}</div>
            <div className="text-sm text-purple-muted">Authors</div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">All Nodes</h2>

          {nodes.length === 0 ? (
            <p className="text-purple-muted italic">No nodes in this iteration</p>
          ) : (
            <div className="space-y-4">
              {nodes.map((node) => {
                const excerpt = node.content.slice(0, 200) + (node.content.length > 200 ? '...' : '')

                return (
                  <Link
                    key={node.id}
                    href={`/node/${node.id}`}
                    className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-light"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-purple-muted">
                        Node #{node.id.slice(0, 8)}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        node.status === 'LIVE'
                          ? 'bg-purple-dark/20 text-purple-dark'
                          : 'bg-gray-light text-purple-muted'
                      }`}>
                        {node.status}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-3">
                      {excerpt}
                    </p>
                    {node.status === NodeStatus.WITHERED && (
                      <p className="text-sm text-purple-muted">
                        by {node.authorName}
                      </p>
                    )}
                    <p className="text-sm text-purple-muted mt-2">
                      {node._count.children} {node._count.children === 1 ? 'response' : 'responses'}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
