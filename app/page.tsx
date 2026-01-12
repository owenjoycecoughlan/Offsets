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
        <header className="mb-12 border-8 border-red p-8 bg-cyan/10">
          <h1 className="text-7xl font-bold text-red mb-6 tracking-tight transform -rotate-1" style={{textShadow: '4px 4px 0px #01F9F0'}}>
            {settings.heroTitle}
          </h1>
          <p className="text-2xl text-foreground font-bold leading-tight border-l-8 border-magenta pl-6 bg-green/10 p-4 transform rotate-1">
            {settings.heroSubtitle}
          </p>
        </header>

        {/* Current Iteration CTA */}
        <section className="mb-12">
          <div className="border-4 border-dashed border-blue p-6 bg-cyan/20">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-4xl font-bold text-blue mb-2">
                  {activeIteration.name}
                  <span className="ml-3 text-sm px-3 py-1 bg-magenta text-white border-2 border-black font-bold uppercase">
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
                className="px-8 py-4 bg-red text-white border-4 border-black font-bold text-xl hover:bg-magenta hover:scale-105 transform transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                PARTICIPATE NOW →
              </Link>
              <Link
                href="/current/tree"
                className="px-6 py-3 border-4 border-blue text-foreground hover:bg-blue hover:text-white transition-colors font-bold"
              >
                VIEW TREE
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-5xl font-bold text-blue mb-8 transform -rotate-1 border-b-8 border-dashed border-green pb-2" style={{textShadow: '3px 3px 0px #CC00B8'}}>
            {settings.howItWorksTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-cyan p-6 bg-red/5 hover:bg-cyan/20 transition-colors">
              <h3 className="text-2xl font-bold text-blue mb-3 border-b-4 border-dotted border-blue pb-2">{settings.step1Title}</h3>
              <p className="text-foreground leading-relaxed">
                {settings.step1Description}
              </p>
            </div>

            <div className="border-4 border-dashed border-magenta p-6 bg-magenta/5">
              <h3 className="text-2xl font-bold text-magenta mb-3">{settings.step2Title}</h3>
              <p className="text-foreground leading-relaxed">
                {settings.step2Description}
              </p>
            </div>

            <div className="border-4 border-green p-6 bg-cyan/5 transform -rotate-1">
              <h3 className="text-xl font-bold text-green mb-3">{settings.step3Title}</h3>
              <p className="text-foreground">
                {settings.step3Description}
              </p>
            </div>

            <div className="border-4 border-blue p-6 bg-blue/5 transform rotate-1">
              <h3 className="text-xl font-bold text-blue mb-3">{settings.step4Title}</h3>
              <p className="text-foreground">
                {settings.step4Description}
              </p>
            </div>
          </div>
        </section>

        {/* Rules */}
        <section className="mb-12 border-8 border-dashed border-green p-8 bg-magenta/5">
          <h2 className="text-4xl font-bold text-magenta mb-6 transform -rotate-1">{settings.rulesTitle}</h2>

          <ul className="space-y-3 text-foreground text-lg">
            <li className="flex gap-3 border-b-4 border-dotted border-blue pb-3">
              <span className="text-red font-bold text-2xl">→</span>
              <span className="font-bold">{settings.rule1}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green font-bold">→</span>
              <span>{settings.rule2}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-cyan font-bold">★</span>
              <span>{settings.rule3}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-magenta font-bold">✖</span>
              <span>{settings.rule4}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue font-bold">→</span>
              <span>{settings.rule5}</span>
            </li>
          </ul>
        </section>

        {/* Past Iterations */}
        {pastIterations.length > 0 && (
          <section className="mb-12">
            <h2 className="text-4xl font-bold text-blue mb-8 border-b-4 border-dotted border-green pb-2" style={{textShadow: '2px 2px 0px #CC00B8'}}>
              Past Iterations
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pastIterations.slice(0, 4).map((iteration, idx) => (
                <Link
                  key={iteration.id}
                  href={`/iterations/${iteration.id}`}
                  className="border-4 border-foreground p-6 hover:border-magenta transition-colors bg-cyan/5 transform hover:scale-105 transition-transform"
                >
                  <h3 className="text-2xl font-bold text-blue mb-2">{iteration.name}</h3>
                  {iteration.description && (
                    <p className="text-sm text-foreground mb-3">{iteration.description}</p>
                  )}
                  <div className="flex gap-4 text-sm font-bold">
                    <span className="text-magenta">{iteration._count.nodes} nodes</span>
                    {iteration.endDate && (
                      <span className="text-green">Ended {new Date(iteration.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {pastIterations.length > 4 && (
              <div className="text-center mt-6">
                <Link
                  href="/iterations"
                  className="text-2xl font-bold text-magenta hover:text-red underline decoration-4 decoration-wavy"
                >
                  View all {pastIterations.length} past iterations {'>>>'}
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Footer Links */}
        <footer className="mt-16 pt-8 border-t-4 border-dashed border-cyan text-center space-x-6">
            <Link
              href="/search"
              className="text-lg font-bold text-blue hover:text-red underline decoration-2"
            >
              [SEARCH]
            </Link>
            <Link
              href="/iterations"
              className="text-lg font-bold text-green hover:text-red underline decoration-2"
            >
              [ALL ITERATIONS]
            </Link>
            <Link
              href="/stats"
              className="text-lg font-bold text-magenta hover:text-red underline decoration-2"
            >
              [STATISTICS]
            </Link>
            <Link
              href="/admin"
              className="text-lg font-bold text-red hover:text-blue underline decoration-2"
            >
              [ADMIN]
            </Link>
          </footer>
        </main>
      </div>
    )
  }