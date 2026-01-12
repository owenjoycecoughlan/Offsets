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

  // Calculate if content exceeds 2 lines (roughly ~80 chars per line)
  const maxCharsForTwoLines = 160
  const needsExpand = data.content.length > maxCharsForTwoLines

  const isLive = data.status === 'LIVE'

  return (
    <div
      className="border-2 border-foreground bg-white"
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
          background: '#222222',
          width: 8,
          height: 8,
        }}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Status badge - smaller */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-gray-mid">
            {data.status}
          </span>
        </div>

        {/* Content preview - always show exactly 2 lines */}
        <div className="flex-1 overflow-hidden">
          <p
            className={`text-sm text-foreground leading-relaxed ${
              !isExpanded ? 'line-clamp-2' : ''
            }`}
            style={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
            }}
          >
            {data.content}
          </p>
        </div>

        {/* Author name for withered nodes */}
        {!isLive && data.authorName && (
          <p className="text-xs text-gray-mid mt-2 italic">
            by {data.authorName}
          </p>
        )}

        {/* Expand/collapse button - always show if content needs it */}
        {needsExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-xs text-foreground hover:text-gray-mid mt-2 text-left underline"
          >
            {isExpanded ? 'Show less' : 'Expand'}
          </button>
        )}

        {/* Published date */}
        <div className="text-xs text-gray-mid mt-1">
          {new Date(data.publishedAt).toLocaleDateString()}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#222222',
          width: 8,
          height: 8,
        }}
      />
    </div>
  )
}

export default memo(CustomNode)
