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
          <Link href="/" className="text-purple-dark hover:text-foreground">
            ← Back to home
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-serif text-foreground mb-2">Search Nodes</h1>
          <p className="text-purple-muted">
            Search through all nodes by content or author name
          </p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-light mb-8">
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
                className="w-full px-4 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-purple-dark focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-purple-dark focus:border-transparent"
              >
                <option value="ALL">All nodes</option>
                <option value="LIVE">Live only</option>
                <option value="WITHERED">Withered only</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="w-full bg-purple-dark text-white py-3 px-6 rounded-lg font-medium hover:bg-foreground disabled:bg-gray-light disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {hasSearched && (
          <div>
            <h2 className="text-2xl font-serif text-foreground mb-6">
              Results ({results.length})
            </h2>

            {results.length === 0 ? (
              <p className="text-purple-muted italic">No results found</p>
            ) : (
              <div className="space-y-4">
                {results.map((node) => {
                  const excerpt = node.content.slice(0, 200) + (node.content.length > 200 ? '...' : '')

                  return (
                    <Link
                      key={node.id}
                      href={`/node/${node.id}`}
                      className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-light"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-sm font-medium text-purple-muted">
                          Node #{node.id.slice(0, 8)}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          node.status === 'LIVE'
                            ? 'bg-purple-dark/20 text-purple-dark'
                            : 'bg-gray-light text-purple-muted'
                        }`}>
                          {node.status}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-3">
                        {excerpt}
                      </p>
                      {node.status === NodeStatus.WITHERED && (
                        <p className="text-sm text-purple-muted">
                          by {node.authorName}
                        </p>
                      )}
                      <p className="text-sm text-purple-muted mt-2">
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
