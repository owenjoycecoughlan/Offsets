'use client'

import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import Link from 'next/link'

interface CustomNodeData {
  content: string
  authorName: string | null
  status: 'LIVE' | 'WITHERED'
  publishedAt: string
  childrenCount: number
  width: number
  height: number
}

function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const [isExpanded, setIsExpanded] = useState(false)
  const maxPreviewLength = 100

  const contentPreview = data.content.length > maxPreviewLength
    ? data.content.slice(0, maxPreviewLength) + '...'
    : data.content

  const isLive = data.status === 'LIVE'

  return (
    <div
      className={`rounded-lg border-2 ${
        isLive
          ? 'border-purple-dark bg-white'
          : 'border-gray-light bg-gray-50'
      } shadow-md hover:shadow-lg transition-shadow`}
      style={{
        width: '100%',
        height: '100%',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: isLive ? '#7c6174' : '#c3c6c3',
          width: 8,
          height: 8,
        }}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Status badge */}
        <div className="flex justify-between items-start mb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              isLive
                ? 'bg-purple-dark/20 text-purple-dark'
                : 'bg-gray-light text-purple-muted'
            }`}
          >
            {data.status}
          </span>
          {data.childrenCount > 0 && (
            <span className="text-xs text-purple-muted">
              {data.childrenCount} {data.childrenCount === 1 ? 'child' : 'children'}
            </span>
          )}
        </div>

        {/* Content preview */}
        <div className="flex-1 overflow-hidden">
          <p
            className={`text-sm text-foreground leading-relaxed ${
              !isExpanded ? 'line-clamp-3' : ''
            }`}
            style={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {isExpanded ? data.content : contentPreview}
          </p>
        </div>

        {/* Author name for withered nodes */}
        {!isLive && data.authorName && (
          <p className="text-xs text-purple-muted mt-2 italic">
            by {data.authorName}
          </p>
        )}

        {/* Expand/collapse button */}
        {data.content.length > maxPreviewLength && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-xs text-purple-dark hover:text-foreground mt-2 text-left underline"
          >
            {isExpanded ? 'Show less' : 'Expand'}
          </button>
        )}

        {/* Published date */}
        <div className="text-xs text-purple-muted mt-1">
          {new Date(data.publishedAt).toLocaleDateString()}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: isLive ? '#7c6174' : '#c3c6c3',
          width: 8,
          height: 8,
        }}
      />
    </div>
  )
}

export default memo(CustomNode)
