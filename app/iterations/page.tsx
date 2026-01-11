import Link from 'next/link'
import { getAllIterations } from '@/lib/iterations'

export default async function IterationsListPage() {
  const iterations = await getAllIterations()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-purple-dark hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <header className="mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-2">All Iterations</h1>
          <p className="text-purple-muted">
            Browse all iterations of the Offsets project
          </p>
        </header>

        <div className="space-y-4">
          {iterations.map((iteration) => (
            <Link
              key={iteration.id}
              href={`/iterations/${iteration.id}`}
              className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-light"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-medium text-foreground">
                  {iteration.name}
                  {iteration.isActive && (
                    <span className="ml-3 text-sm px-3 py-1 bg-purple-dark text-white rounded">
                      Active
                    </span>
                  )}
                </h3>
              </div>

              {iteration.description && (
                <p className="text-purple-muted text-sm mb-3">{iteration.description}</p>
              )}

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
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
