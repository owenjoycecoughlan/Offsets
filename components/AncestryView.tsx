'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NodeStatus } from '@prisma/client'

interface AncestryNode {
  id: string
  content: string
  authorName: string
  status: NodeStatus
  publishedAt: Date | null
}

interface AncestryViewProps {
  nodeId: string
}

export default function AncestryView({ nodeId }: AncestryViewProps) {
  const [ancestry, setAncestry] = useState<AncestryNode[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && ancestry.length === 0) {
      loadAncestry()
    }
  }, [isOpen])

  const loadAncestry = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/nodes/${nodeId}/ancestry`)
      if (response.ok) {
        const data = await response.json()
        setAncestry(data.ancestry)
      }
    } catch (err) {
      console.error('Failed to load ancestry:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        {isOpen ? 'Hide' : 'View'} full ancestry
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading ancestry...</p>
          ) : ancestry.length > 0 ? (
            <>
              <p className="text-sm font-medium text-gray-700">
                Path from root ({ancestry.length} node{ancestry.length !== 1 ? 's' : ''}):
              </p>
              <div className="space-y-2">
                {ancestry.map((node, index) => (
                  <div key={node.id} className="pl-4 border-l-2 border-gray-300">
                    <Link
                      href={`/node/${node.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      #{node.id.slice(0, 8)}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {node.content.slice(0, 100)}...
                    </p>
                    {node.status === NodeStatus.WITHERED && (
                      <p className="text-xs text-gray-500 mt-1">
                        by {node.authorName}
                      </p>
                    )}
                    {index < ancestry.length - 1 && (
                      <div className="text-gray-400 text-xs mt-1">↓</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No ancestry found</p>
          )}
        </div>
      )}
    </div>
  )
}
