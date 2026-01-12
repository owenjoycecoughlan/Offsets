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
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <header className="mb-12 border-2 border-foreground p-8">
          <h1 className="text-6xl font-bold text-foreground mb-6">
            {settings.heroTitle}
          </h1>
          <p className="text-xl text-foreground leading-relaxed border-l-2 border-foreground pl-6 p-4">
            {settings.heroSubtitle}
          </p>
        </header>

        {/* Current Iteration CTA */}
        <section className="mb-12">
          <div className="border-2 border-foreground p-6">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {activeIteration.name}
                <span className="ml-3 text-sm px-3 py-1 bg-foreground text-white font-bold uppercase">
                  NOW ACTIVE
                </span>
              </h2>
              {activeIteration.description && (
                <p className="text-foreground text-base mt-2">{activeIteration.description}</p>
              )}
            </div>
            <div className="flex gap-4 mt-6 flex-wrap">
              <Link
                href="/current"
                className="px-8 py-4 bg-foreground text-white border-2 border-foreground font-bold text-lg hover:bg-gray-mid transition-colors"
              >
                PARTICIPATE NOW
              </Link>
              <Link
                href="/current/tree"
                className="px-6 py-3 border-2 border-foreground text-foreground hover:bg-gray-mid hover:text-white transition-colors font-bold"
              >
                VIEW TREE
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-8 border-b-2 border-foreground pb-2">
            {settings.howItWorksTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-foreground p-6">
              <h3 className="text-xl font-bold text-foreground mb-3 border-b-2 border-foreground pb-2">{settings.step1Title}</h3>
              <p className="text-foreground leading-relaxed">
                {settings.step1Description}
              </p>
            </div>

            <div className="border-2 border-foreground p-6">
              <h3 className="text-xl font-bold text-foreground mb-3 border-b-2 border-foreground pb-2">{settings.step2Title}</h3>
              <p className="text-foreground leading-relaxed">
                {settings.step2Description}
              </p>
            </div>

            <div className="border-2 border-foreground p-6">
              <h3 className="text-xl font-bold text-foreground mb-3 border-b-2 border-foreground pb-2">{settings.step3Title}</h3>
              <p className="text-foreground leading-relaxed">
                {settings.step3Description}
              </p>
            </div>

            <div className="border-2 border-foreground p-6">
              <h3 className="text-xl font-bold text-foreground mb-3 border-b-2 border-foreground pb-2">{settings.step4Title}</h3>
              <p className="text-foreground leading-relaxed">
                {settings.step4Description}
              </p>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="mb-12 border-2 border-foreground p-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">{settings.rulesTitle}</h2>

          <ul className="space-y-3 text-foreground text-base list-disc list-inside">
            <li className="font-bold">{settings.rule1}</li>
            <li>{settings.rule2}</li>
            <li>{settings.rule3}</li>
            <li>{settings.rule4}</li>
            <li>{settings.rule5}</li>
          </ul>
        </section>

        {/* Past Iterations */}
        {pastIterations.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-8 border-b-2 border-foreground pb-2">
              Past Iterations
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pastIterations.slice(0, 4).map((iteration, idx) => (
                <Link
                  key={iteration.id}
                  href={`/iterations/${iteration.id}`}
                  className="border-2 border-foreground p-6 hover:border-gray-mid transition-colors"
                >
                  <h3 className="text-xl font-bold text-foreground mb-2">{iteration.name}</h3>
                  {iteration.description && (
                    <p className="text-sm text-foreground mb-3">{iteration.description}</p>
                  )}
                  <div className="flex gap-4 text-sm font-bold">
                    <span className="text-gray-mid">{iteration._count.nodes} nodes</span>
                    {iteration.endDate && (
                      <span className="text-gray-light">Ended {new Date(iteration.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {pastIterations.length > 4 && (
              <div className="text-center mt-6">
                <Link
                  href="/iterations"
                  className="text-lg font-bold text-foreground hover:text-gray-mid underline"
                >
                  View all {pastIterations.length} past iterations
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Footer Links */}
        <footer className="mt-16 pt-8 border-t-2 border-foreground text-center space-x-6">
            <Link
              href="/search"
              className="text-base font-bold text-foreground hover:text-gray-mid underline"
            >
              SEARCH
            </Link>
            <Link
              href="/iterations"
              className="text-base font-bold text-foreground hover:text-gray-mid underline"
            >
              ALL ITERATIONS
            </Link>
            <Link
              href="/stats"
              className="text-base font-bold text-foreground hover:text-gray-mid underline"
            >
              STATISTICS
            </Link>
            <Link
              href="/admin"
              className="text-base font-bold text-foreground hover:text-gray-mid underline"
            >
              ADMIN
            </Link>
          </footer>
        </main>
      </div>
    )
  }