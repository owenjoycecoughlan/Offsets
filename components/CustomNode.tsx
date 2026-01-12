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
  nodeId: string
}

function CustomNode({ data }: NodeProps<CustomNodeData>) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isLive = data.status === 'LIVE'

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className="border-2 border-foreground bg-white cursor-pointer"
      onClick={handleClick}
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

        {/* Content preview - click to expand */}
        <div className="flex-1 overflow-hidden relative">
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
          {!isExpanded && data.content.length > 100 && (
            <div className="absolute bottom-0 right-0 text-xs text-gray-mid bg-white px-1">
              (click to expand)
            </div>
          )}
        </div>

        {/* Author name for withered nodes */}
        {!isLive && data.authorName && (
          <p className="text-xs text-gray-mid mt-2 italic">
            by {data.authorName}
          </p>
        )}

        {/* Contribute button - only show when expanded and live */}
        {isExpanded && isLive && (
          <Link
            href={`/node/${data.nodeId}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 px-4 py-2 bg-foreground text-white border-2 border-foreground font-bold text-xs hover:bg-gray-mid transition-colors text-center"
          >
            CONTRIBUTE
          </Link>
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
