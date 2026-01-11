import Link from 'next/link'
import { getActiveIteration, getAllIterations } from '@/lib/iterations'
import { getSiteSettings } from '@/lib/settings'

export default async function Home() {
  const activeIteration = await getActiveIteration()
  const allIterations = await getAllIterations()
  const pastIterations = allIterations.filter(i => !i.isActive)
  const settings = await getSiteSettings()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-serif text-foreground mb-4">{settings.heroTitle}</h1>
          <p className="text-xl text-purple-dark max-w-2xl mx-auto">
            {settings.heroSubtitle}
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
          <h2 className="text-3xl font-serif text-foreground mb-6 text-center">{settings.howItWorksTitle}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
              <h3 className="text-xl font-medium text-foreground mb-3">{settings.step1Title}</h3>
              <p className="text-purple-dark">
                {settings.step1Description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
              <h3 className="text-xl font-medium text-foreground mb-3">{settings.step2Title}</h3>
              <p className="text-purple-dark">
                {settings.step2Description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
              <h3 className="text-xl font-medium text-foreground mb-3">{settings.step3Title}</h3>
              <p className="text-purple-dark">
                {settings.step3Description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-light">
              <h3 className="text-xl font-medium text-foreground mb-3">{settings.step4Title}</h3>
              <p className="text-purple-dark">
                {settings.step4Description}
              </p>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="mb-16 bg-white p-8 rounded-lg shadow border border-gray-light">
          <h2 className="text-3xl font-serif text-foreground mb-6">{settings.rulesTitle}</h2>

          <ul className="space-y-4 text-purple-dark">
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span>{settings.rule1}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span>{settings.rule2}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span>{settings.rule3}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span>{settings.rule4}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-dark font-bold">•</span>
              <span>{settings.rule5}</span>
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
