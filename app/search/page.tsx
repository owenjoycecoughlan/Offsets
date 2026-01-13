'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NodeStatus } from '@prisma/client'

interface SearchResult {
  id: string
  content: string
  authorName: string
  status: NodeStatus
  publishedAt: Date | null
  _count: {
    children: number
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | NodeStatus>('ALL')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams({
        q: query,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      })

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-teal hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-serif text-foreground mb-2">Search Nodes</h1>
          <p className="text-gray-mid">
            Search through all nodes by content or author name
          </p>
        </header>

        <div className="p-6 border border-gray-light mb-8" style={{ backgroundColor: '#3a3a3a' }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-foreground mb-2">
                Search query
              </label>
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-2 bg-background text-foreground border-2 border-gray-light focus:border-teal focus:outline-none"
                placeholder="Enter keywords, author name, or text..."
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
                Filter by status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | NodeStatus)}
                className="w-full px-4 py-2 bg-background text-foreground border-2 border-gray-light focus:border-teal focus:outline-none"
              >
                <option value="ALL">All nodes</option>
                <option value="LIVE">Live only</option>
                <option value="WITHERED">Withered only</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="w-full bg-background text-teal py-3 px-6 border-2 border-teal font-bold hover:bg-teal hover:text-background disabled:bg-gray-light disabled:border-gray-light disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </div>
        </div>

        {hasSearched && (
          <div>
            <h2 className="text-2xl font-serif text-foreground mb-6">
              Results ({results.length})
            </h2>

            {results.length === 0 ? (
              <p className="text-gray-mid italic">No results found</p>
            ) : (
              <div className="space-y-4">
                {results.map((node) => {
                  const excerpt = node.content.slice(0, 200) + (node.content.length > 200 ? '...' : '')

                  return (
                    <Link
                      key={node.id}
                      href={`/node/${node.id}`}
                      className="block p-6 border border-gray-light hover:border-teal transition-colors no-underline"
                      style={{ backgroundColor: '#3a3a3a' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-medium text-gray-mid">
                          Node #{node.id.slice(0, 8)}
                        </h3>
                        <span className={`text-xs px-2 py-1 font-bold ${
                          node.status === 'LIVE'
                            ? 'text-teal'
                            : 'text-gray-mid'
                        }`}>
                          {node.status}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-3">
                        {excerpt}
                      </p>
                      {node.status === NodeStatus.WITHERED && (
                        <p className="text-sm text-gray-mid">
                          by {node.authorName}
                        </p>
                      )}
                      <p className="text-sm text-gray-mid mt-2">
                        {node._count.children} {node._count.children === 1 ? 'response' : 'responses'}
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
