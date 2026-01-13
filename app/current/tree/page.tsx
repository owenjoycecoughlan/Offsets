import Link from 'next/link'
import { getActiveIteration } from '@/lib/iterations'
import TreeView from '@/components/TreeView'

export default async function CurrentTreeViewPage() {
  const activeIteration = await getActiveIteration()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
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
              className="px-4 py-2 bg-background text-teal border-2 border-teal font-bold hover:bg-teal hover:text-background transition-colors no-underline"
            >
              List View
            </Link>
            <Link
              href="/current/tree"
              className="px-4 py-2 bg-teal text-background border-2 border-teal font-bold no-underline"
            >
              Tree View
            </Link>
          </div>
        </header>

        <TreeView iterationId={activeIteration.id} />
      </main>
    </div>
  )
}
