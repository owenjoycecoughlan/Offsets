import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getIterationById } from '@/lib/iterations'

export default async function IterationTreeViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const iteration = await getIterationById(id)

  if (!iteration) {
    notFound()
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
          <div className="flex gap-4">
            <Link
              href={`/iterations/${id}`}
              className="text-sm px-4 py-2 border border-gray-light text-foreground rounded-lg hover:bg-background"
            >
              List View
            </Link>
            <Link
              href={`/iterations/${id}/tree`}
              className="text-sm px-4 py-2 bg-purple-dark text-white rounded-lg"
            >
              Tree View
            </Link>
          </div>
        </header>

        <div className="bg-white p-12 rounded-lg shadow border border-gray-light text-center">
          <h2 className="text-2xl font-serif text-foreground mb-4">Tree View Coming Soon</h2>
          <p className="text-purple-muted mb-6">
            Interactive tree visualization will be implemented here
          </p>
          <Link
            href={`/iterations/${id}`}
            className="inline-block px-6 py-3 bg-purple-dark text-white rounded-lg hover:bg-foreground transition-colors"
          >
            View List for Now
          </Link>
        </div>
      </main>
    </div>
  )
}
