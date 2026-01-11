import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import { getAllIterations } from '@/lib/iterations'
import NewIterationButton from '@/components/NewIterationButton'

export default async function IterationsPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const iterations = await getAllIterations()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/admin" className="text-purple-dark hover:text-foreground">
            ← Back to admin
          </Link>
        </div>

        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-serif text-foreground mb-2">Iterations</h1>
            <p className="text-purple-muted">
              Manage project iterations and archive completed rounds
            </p>
          </div>
          <NewIterationButton />
        </header>

        <div className="space-y-4">
          {iterations.map((iteration) => (
            <div
              key={iteration.id}
              className="bg-white p-6 rounded-lg shadow border border-gray-light"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-medium text-foreground">
                    {iteration.name}
                    {iteration.isActive && (
                      <span className="ml-3 text-sm px-3 py-1 bg-purple-dark text-white rounded">
                        Active
                      </span>
                    )}
                  </h3>
                  {iteration.description && (
                    <p className="text-purple-muted text-sm mt-1">
                      {iteration.description}
                    </p>
                  )}
                </div>
              </div>

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
                <div>
                  <span className="font-medium">Nodes:</span> {iteration._count.nodes}
                </div>
              </div>

              {!iteration.isActive && (
                <div className="mt-4">
                  <Link
                    href={`/iterations/${iteration.id}`}
                    className="text-sm text-purple-dark hover:text-foreground underline"
                  >
                    View archive →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
