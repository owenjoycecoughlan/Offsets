import Link from 'next/link'
import { getLiveNodes, daysSinceLastResponse } from '@/lib/nodes'
import { getActiveIteration } from '@/lib/iterations'

export default async function CurrentIterationPage() {
  const activeIteration = await getActiveIteration()
  const nodes = await getLiveNodes()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-teal hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-serif text-foreground mb-2">
            {activeIteration.name}
            <span className="ml-3 text-base px-3 py-1 bg-background text-foreground border-2 border-foreground font-bold uppercase">
              Active
            </span>
          </h1>
          {activeIteration.description && (
            <p className="text-gray-mid mb-4">{activeIteration.description}</p>
          )}
          <div className="flex gap-4 items-center">
            <Link
              href="/current"
              className="px-4 py-2 bg-teal text-background border-2 border-teal font-bold hover:bg-background hover:text-teal transition-colors"
            >
              List View
            </Link>
            <Link
              href="/current/tree"
              className="px-4 py-2 bg-background text-teal border-2 border-teal font-bold hover:bg-teal hover:text-background transition-colors"
            >
              Tree View
            </Link>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-serif text-foreground mb-6">Live Nodes</h2>

          {nodes.length === 0 ? (
            <p className="text-purple-muted italic">No live nodes yet. Check back soon!</p>
          ) : (
            <div className="space-y-4">
              {nodes.map((node) => {
                const daysSince = daysSinceLastResponse(node)
                const daysRemaining = daysSince !== null ? Math.max(0, 3 - daysSince) : 3
                const excerpt = node.content.slice(0, 150) + (node.content.length > 150 ? '...' : '')

                return (
                  <Link
                    key={node.id}
                    href={`/node/${node.id}`}
                    className="block p-6 border border-gray-light hover:border-teal transition-colors no-underline"
                    style={{ backgroundColor: '#3a3a3a' }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-gray-mid">
                        Node #{node.id.slice(0, 8)}
                      </h3>
                      <div className="text-sm text-gray-mid">
                        <span>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} until withering</span>
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {excerpt}
                    </p>
                    <div className="mt-4 text-sm text-gray-mid">
                      {node._count.children} {node._count.children === 1 ? 'response' : 'responses'}
                    </div>
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
