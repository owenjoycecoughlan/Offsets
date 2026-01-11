import Link from 'next/link'
import { getLiveNodes, daysSinceLastResponse } from '@/lib/nodes'

export default async function Home() {
  const nodes = await getLiveNodes()

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-serif text-gray-900 mb-2">Offsets</h1>
          <p className="text-lg text-gray-600">
            A collaborative literary project where nodes branch and grow like a tree
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">Live Nodes</h2>

          {nodes.length === 0 ? (
            <p className="text-gray-500 italic">No live nodes yet. Check back soon!</p>
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
                    className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-gray-500">
                        Node #{node.id.slice(0, 8)}
                      </h3>
                      <div className="text-sm text-gray-500">
                        {daysRemaining > 0 ? (
                          <span>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} until withering</span>
                        ) : (
                          <span className="text-amber-600">Withering soon</span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {excerpt}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      {node._count.children} {node._count.children === 1 ? 'response' : 'responses'}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <div className="mt-8 text-center">
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Admin Panel
          </Link>
        </div>
      </main>
    </div>
  )
}
