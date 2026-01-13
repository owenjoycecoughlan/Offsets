import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPendingNodes } from '@/lib/nodes'
import { isAdminAuthenticated } from '@/lib/auth'
import ApprovalButtons from '@/components/ApprovalButtons'
import LogoutButton from '@/components/LogoutButton'

export default async function AdminPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const pendingNodes = await getPendingNodes()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <div className="flex gap-4 items-center">
            <Link
              href="/admin/settings"
              className="text-sm text-foreground hover:text-gray-mid underline"
            >
              Site Settings
            </Link>
            <Link
              href="/admin/iterations"
              className="text-sm text-foreground hover:text-gray-mid underline"
            >
              Manage Iterations
            </Link>
            <LogoutButton />
            <Link
              href="/"
              className="text-foreground hover:text-gray-mid"
            >
              Back to home
            </Link>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Pending Submissions ({pendingNodes.length})
          </h2>

          {pendingNodes.length === 0 ? (
            <p className="text-gray-mid">No pending submissions</p>
          ) : (
            <div className="space-y-6">
              {pendingNodes.map((node) => (
                <div
                  key={node.id}
                  className="p-6 border-2 border-foreground"
                  style={{ backgroundColor: '#3a3a3a' }}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">
                      Submission #{node.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-mid">
                      Submitted {new Date(node.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {node.parent && (
                    <div className="mb-4 p-4 border-2 border-gray-light" style={{ backgroundColor: '#2b2b2b' }}>
                      <p className="text-xs font-bold text-gray-mid mb-2">
                        RESPONDING TO:
                      </p>
                      <Link
                        href={`/node/${node.parent.id}`}
                        className="text-sm text-teal hover:text-foreground underline"
                      >
                        Node #{node.parent.id.slice(0, 8)}
                      </Link>
                      <p className="text-sm text-foreground mt-2 line-clamp-3">
                        {node.parent.content}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-bold text-foreground mb-2">
                      Author: {node.authorName}
                    </p>
                    <div className="prose max-w-none">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {node.content}
                      </p>
                    </div>
                  </div>

                  {!node.parent && (
                    <div className="mb-4 border-2 border-yellow-border p-3 text-sm text-foreground" style={{ backgroundColor: '#2b2b2b' }}>
                      This is a root node (no parent)
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-gray-light">
                    <ApprovalButtons nodeId={node.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
