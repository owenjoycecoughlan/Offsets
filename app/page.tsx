import Link from 'next/link'
import { getActiveIteration, getAllIterations } from '@/lib/iterations'

export default async function Home() {
  const activeIteration = await getActiveIteration()
  const allIterations = await getAllIterations()
  const pastIterations = allIterations.filter(i => !i.isActive)

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-serif text-foreground mb-4">Offsets</h1>
          <p className="text-xl text-purple-dark max-w-2xl mx-auto">
            A collaborative literary project where nodes of creative writing branch and grow like a tree
          </p>
        </header>

        {/* Current Iteration CTA */}
        <section className="mb-16">
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-light">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-serif text-foreground mb-2">
                  {activeIteration.name}
                  <span className="ml-3 text-base px-3 py-1 bg-purple-dark text-white rounded">
                    Now Active
                  </span>
                </h2>
                {activeIteration.description && (
                  <p className="text-purple-muted">{activeIteration.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Link
                href="/current"
                className="px-6 py-3 bg-purple-dark text-white rounded-lg hover:bg-foreground transition-colors font-medium"
              >
                Participate Now →
              </Link>
              <Link
                href="/current/tree"
                className="px-6 py-3 border border-gray-light text-foreground rounded-lg hover:bg-background transition-colors"
              >
                View Tree
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif text-foreground mb-6 text-center">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
              <h3 className="text-xl font-medium text-foreground mb-3">1. Read & Respond</h3>
              <p className="text-purple-dark">
                Browse live nodes and respond with your own creative writing. Your response can be any length and connect to the parent node through linguistic, conceptual, formal, or stylistic links.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
              <h3 className="text-xl font-medium text-foreground mb-3">2. Stay Anonymous</h3>
              <p className="text-purple-dark">
                Your name stays hidden until your node "withers" - when it receives no responses for 3 days. This keeps the focus on the writing itself.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
              <h3 className="text-xl font-medium text-foreground mb-3">3. Branch & Grow</h3>
              <p className="text-purple-dark">
                Each response creates a new branch in the tree. Multiple people can respond to the same node, creating a network of interconnected creative writing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
              <h3 className="text-xl font-medium text-foreground mb-3">4. Admin Approval</h3>
              <p className="text-purple-dark">
                All submissions are reviewed before publishing to maintain quality and intention. Once approved, your node goes live immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="mb-16 bg-white p-8 rounded-lg shadow border border-gray-light">
          <h2 className="text-3xl font-serif text-foreground mb-6">The Rules</h2>

          <ul className="space-y-4 text-purple-dark">
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span><strong>Any length:</strong> Your node can be a single word or a lengthy piece - there's no character limit.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span><strong>Any connection:</strong> Link to your parent node however you see fit - thematically, formally, linguistically, or conceptually.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span><strong>Withering period:</strong> If a live node receives no responses for 3 days, it "withers" and the author's name is revealed.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span><strong>No responses to withered nodes:</strong> Once a node has withered, it can no longer receive new responses.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span><strong>Submit your name:</strong> Enter your name with each submission - it will be revealed when your node withers.</span>
            </li>
          </ul>
        </section>

        {/* Past Iterations */}
        {pastIterations.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-serif text-foreground mb-6 text-center">Past Iterations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pastIterations.slice(0, 4).map((iteration) => (
                <Link
                  key={iteration.id}
                  href={`/iterations/${iteration.id}`}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-light"
                >
                  <h3 className="text-lg font-medium text-foreground mb-2">{iteration.name}</h3>
                  {iteration.description && (
                    <p className="text-sm text-purple-muted mb-3">{iteration.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-purple-muted">
                    <span>{iteration._count.nodes} nodes</span>
                    {iteration.endDate && (
                      <span>Ended {new Date(iteration.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {pastIterations.length > 4 && (
              <div className="text-center mt-6">
                <Link
                  href="/iterations"
                  className="text-purple-dark hover:text-foreground underline"
                >
                  View all {pastIterations.length} past iterations →
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Footer Links */}
        <footer className="mt-16 pt-8 border-t border-gray-light text-center space-x-6">
          <Link
            href="/search"
            className="text-sm text-purple-muted hover:text-purple-dark underline"
          >
            Search
          </Link>
          <Link
            href="/iterations"
            className="text-sm text-purple-muted hover:text-purple-dark underline"
          >
            All Iterations
          </Link>
          <Link
            href="/stats"
            className="text-sm text-purple-muted hover:text-purple-dark underline"
          >
            Statistics
          </Link>
          <Link
            href="/admin"
            className="text-sm text-purple-muted hover:text-purple-dark underline"
          >
            Admin
          </Link>
        </footer>
      </main>
    </div>
  )
}
