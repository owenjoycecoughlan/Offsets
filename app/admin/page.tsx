import Link from 'next/link'
import { getPendingNodes } from '@/lib/nodes'
import ApprovalButtons from '@/components/ApprovalButtons'

export default async function AdminPage() {
  const pendingNodes = await getPendingNodes()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-serif text-foreground">Admin Panel</h1>
          <Link
            href="/"
            className="text-purple-dark hover:text-foreground"
          >
            ← Back to home
          </Link>
        </div>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Pending Submissions ({pendingNodes.length})
          </h2>

          {pendingNodes.length === 0 ? (
            <p className="text-purple-muted italic">No pending submissions</p>
          ) : (
            <div className="space-y-6">
              {pendingNodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-white p-6 rounded-lg shadow border border-gray-light"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-foreground">
                        Submission #{node.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-purple-muted">
                        Submitted {new Date(node.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <ApprovalButtons nodeId={node.id} />
                  </div>

                  {node.parent && (
                    <div className="mb-4 p-4 bg-background rounded border border-gray-light">
                      <p className="text-xs font-medium text-purple-muted mb-2">
                        RESPONDING TO:
                      </p>
                      <Link
                        href={`/node/${node.parent.id}`}
                        className="text-sm text-purple-dark hover:text-foreground"
                      >
                        Node #{node.parent.id.slice(0, 8)}
                      </Link>
                      <p className="text-sm text-purple-dark mt-2 line-clamp-3">
                        {node.parent.content}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Author: {node.authorName}
                    </p>
                    <div className="prose max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {node.content}
                      </p>
                    </div>
                  </div>

                  {!node.parent && (
                    <div className="bg-purple-muted/20 border border-purple-muted p-3 rounded text-sm text-purple-dark">
                      This is a root node (no parent)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
