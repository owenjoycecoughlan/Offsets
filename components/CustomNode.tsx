'use client'

import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import NodeModal from './NodeModal'

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
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isLive = data.status === 'LIVE'

  // Check if content needs truncation (more than ~2 lines worth of text)
  const needsTruncation = data.content.length > 80

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(true)
  }

  return (
    <>
      <div
        className="border-2 border-foreground bg-white cursor-pointer hover:border-gray-mid transition-colors"
        onClick={handleClick}
        onMouseDown={(e) => e.stopPropagation()}
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
          {/* Status badge and author - in one line for withered nodes */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-mid">
              {data.status}
            </span>
            {!isLive && data.authorName && (
              <span className="text-xs text-gray-mid italic">
                by {data.authorName}
              </span>
            )}
          </div>

          {/* Content preview - click to view full */}
          <div className="flex-1 overflow-hidden relative">
            <p
              className="text-sm text-foreground leading-relaxed line-clamp-2"
              style={{
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
              }}
            >
              {data.content}
            </p>
            {needsTruncation && (
              <div className="absolute bottom-0 right-0 text-xs text-gray-mid bg-white px-1 font-bold">
                click to view
              </div>
            )}
          </div>

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

      <NodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={data.content}
        authorName={data.authorName}
        status={data.status}
        nodeId={data.nodeId}
        publishedAt={data.publishedAt}
      />
    </>
  )
}

export default memo(CustomNode)
