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
        <header className="mb-12 border-8 border-foreground p-8 bg-gray-lighter/20">
          <h1 className="text-7xl font-bold text-foreground mb-6 tracking-tight transform -rotate-1" style={{textShadow: '4px 4px 0px #aaaaaa'}}>
            {settings.heroTitle}
          </h1>
          <p className="text-2xl text-gray-dark font-bold leading-tight border-l-8 border-gray-mid pl-6 bg-gray-lighter/10 p-4 transform rotate-1">
            {settings.heroSubtitle}
          </p>
        </header>

        {/* Current Iteration CTA */}
        <section className="mb-12">
          <div className="border-4 border-dashed border-gray-mid p-6 bg-gray-lighter/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-4xl font-bold text-gray-dark mb-2">
                  {activeIteration.name}
                  <span className="ml-3 text-sm px-3 py-1 bg-foreground text-white border-2 border-foreground font-bold uppercase">
                    ★ NOW ACTIVE ★
                  </span>
                </h2>
                {activeIteration.description && (
                  <p className="text-foreground text-lg mt-2">{activeIteration.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6 flex-wrap">
              <Link
                href="/current"
                className="px-8 py-4 bg-foreground text-white border-4 border-foreground font-bold text-xl hover:bg-gray-dark hover:scale-105 transform transition-all shadow-[4px_4px_0px_0px_rgba(34,34,34,1)]"
              >
                PARTICIPATE NOW →
              </Link>
              <Link
                href="/current/tree"
                className="px-6 py-3 border-4 border-gray-mid text-foreground hover:bg-gray-mid hover:text-white transition-colors font-bold"
              >
                VIEW TREE
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-5xl font-bold text-foreground mb-8 transform -rotate-1 border-b-8 border-dashed border-gray-mid pb-2" style={{textShadow: '3px 3px 0px #aaaaaa'}}>
            {settings.howItWorksTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-gray-light p-6 bg-gray-lighter/5 hover:bg-gray-lighter/20 transition-colors">
              <h3 className="text-2xl font-bold text-gray-dark mb-3 border-b-4 border-dotted border-gray-mid pb-2">{settings.step1Title}</h3>
              <p className="text-foreground leading-relaxed">
                {settings.step1Description}
              </p>
            </div>

            <div className="border-4 border-dashed border-gray-mid p-6 bg-gray-dark/5">
              <h3 className="text-2xl font-bold text-gray-dark mb-3">{settings.step2Title}</h3>
              <p className="text-foreground leading-relaxed">
                {settings.step2Description}
              </p>
            </div>

            <div className="border-4 border-gray-mid p-6 bg-gray-lighter/5 transform -rotate-1">
              <h3 className="text-xl font-bold text-gray-dark mb-3">{settings.step3Title}</h3>
              <p className="text-foreground">
                {settings.step3Description}
              </p>
            </div>

            <div className="border-4 border-gray-light p-6 bg-gray-mid/5 transform rotate-1">
              <h3 className="text-xl font-bold text-gray-dark mb-3">{settings.step4Title}</h3>
              <p className="text-foreground">
                {settings.step4Description}
              </p>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="mb-12 border-8 border-dashed border-gray-mid p-8 bg-gray-dark/5">
          <h2 className="text-4xl font-bold text-foreground mb-6 transform -rotate-1">{settings.rulesTitle}</h2>

          <ul className="space-y-3 text-foreground text-lg">
            <li className="flex gap-3 border-b-4 border-dotted border-gray-mid pb-3">
              <span className="text-foreground font-bold text-2xl">→</span>
              <span className="font-bold">{settings.rule1}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gray-dark font-bold">→</span>
              <span>{settings.rule2}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gray-light font-bold">★</span>
              <span>{settings.rule3}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gray-mid font-bold">✖</span>
              <span>{settings.rule4}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gray-dark font-bold">→</span>
              <span>{settings.rule5}</span>
            </li>
          </ul>
        </section>

        {/* Past Iterations */}
        {pastIterations.length > 0 && (
          <section className="mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-8 border-b-4 border-dotted border-gray-mid pb-2" style={{textShadow: '2px 2px 0px #aaaaaa'}}>
              Past Iterations
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pastIterations.slice(0, 4).map((iteration, idx) => (
                <Link
                  key={iteration.id}
                  href={`/iterations/${iteration.id}`}
                  className="border-4 border-foreground p-6 hover:border-gray-dark transition-colors bg-gray-lighter/5 transform hover:scale-105 transition-transform"
                >
                  <h3 className="text-2xl font-bold text-gray-dark mb-2">{iteration.name}</h3>
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
                  className="text-2xl font-bold text-gray-dark hover:text-foreground underline decoration-4"
                >
                  View all {pastIterations.length} past iterations {'>>>'}
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Footer Links */}
        <footer className="mt-16 pt-8 border-t-4 border-dashed border-gray-mid text-center space-x-6">
            <Link
              href="/search"
              className="text-lg font-bold text-gray-dark hover:text-foreground underline decoration-2"
            >
              [SEARCH]
            </Link>
            <Link
              href="/iterations"
              className="text-lg font-bold text-gray-mid hover:text-foreground underline decoration-2"
            >
              [ALL ITERATIONS]
            </Link>
            <Link
              href="/stats"
              className="text-lg font-bold text-gray-light hover:text-foreground underline decoration-2"
            >
              [STATISTICS]
            </Link>
            <Link
              href="/admin"
              className="text-lg font-bold text-foreground hover:text-gray-dark underline decoration-2"
            >
              [ADMIN]
            </Link>
          </footer>
        </main>
      </div>
    )
  }