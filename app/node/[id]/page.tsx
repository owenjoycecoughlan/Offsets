import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNodeWithContext } from '@/lib/nodes'
import { NodeStatus } from '@prisma/client'
import ResponseForm from '@/components/ResponseForm'
import AncestryView from '@/components/AncestryView'

export default async function NodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const node = await getNodeWithContext(id)

  if (!node || node.status === NodeStatus.PENDING) {
    notFound()
  }

  const canRespond = node.status === NodeStatus.LIVE

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to live nodes
          </Link>
        </div>

        {/* Parent Node (if exists) */}
        {node.parent && (
          <section className="mb-8 bg-gray-100 p-6 rounded-lg border border-gray-300">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-gray-600">
                Parent Node #{node.parent.id.slice(0, 8)}
              </h3>
              <Link
                href={`/node/${node.parent.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View full node →
              </Link>
            </div>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {node.parent.content}
            </p>
            {node.parent.status === NodeStatus.WITHERED && (
              <p className="mt-3 text-sm text-gray-500">
                by {node.parent.authorName}
              </p>
            )}
          </section>
        )}

        {/* Current Node */}
        <section className="mb-8 bg-white p-8 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-serif text-gray-900">
              Node #{node.id.slice(0, 8)}
            </h2>
            {node.parentId && <AncestryView nodeId={node.id} />}
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {node.content}
            </p>
          </div>

          {node.status === NodeStatus.WITHERED && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                <span className="font-medium">Author:</span> {node.authorName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This node withered on {node.witheredAt ? new Date(node.witheredAt).toLocaleDateString() : 'unknown date'}
              </p>
            </div>
          )}

          {node.children.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Responses ({node.children.length})
              </h3>
              <div className="space-y-2">
                {node.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/node/${child.id}`}
                    className="block p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-gray-700 line-clamp-2">
                      {child.content.slice(0, 120)}...
                    </p>
                    {child.status === NodeStatus.WITHERED && (
                      <p className="text-sm text-gray-500 mt-1">
                        by {child.authorName}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Response Form */}
        {canRespond && (
          <section className="bg-white p-8 rounded-lg shadow border border-gray-200">
            <h3 className="text-xl font-serif text-gray-900 mb-4">
              Respond to this node
            </h3>
            <ResponseForm parentId={node.id} />
          </section>
        )}

        {!canRespond && node.status === NodeStatus.WITHERED && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
            <p className="text-amber-800">
              This node has withered and can no longer receive responses.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
