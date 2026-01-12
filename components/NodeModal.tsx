'use client'

import Link from 'next/link'

interface NodeModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
  authorName: string | null
  status: 'LIVE' | 'WITHERED'
  nodeId: string
  publishedAt: string
}

export default function NodeModal({
  isOpen,
  onClose,
  content,
  authorName,
  status,
  nodeId,
  publishedAt,
}: NodeModalProps) {
  if (!isOpen) return null

  const isLive = status === 'LIVE'

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-foreground max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs text-gray-mid font-bold">{status}</span>
              {!isLive && authorName && (
                <span className="text-xs text-gray-mid italic ml-3">
                  by {authorName}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-foreground hover:text-gray-mid font-bold text-xl"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Date */}
          <div className="text-xs text-gray-mid mb-4">
            Published: {new Date(publishedAt).toLocaleDateString()}
          </div>

          {/* Action button */}
          {isLive && (
            <Link
              href={`/node/${nodeId}`}
              className="block w-full py-3 px-6 bg-foreground text-white border-2 border-foreground font-bold text-center hover:bg-gray-mid transition-colors"
            >
              CONTRIBUTE
            </Link>
          )}

          {!isLive && (
            <div className="py-3 px-6 bg-gray-light/20 border-2 border-gray-light text-center text-gray-mid">
              This node has withered
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
