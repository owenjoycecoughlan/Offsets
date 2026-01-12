'use client'

import { useEffect, useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import CustomNode from './CustomNode'

interface TreeNode {
  id: string
  content: string
  authorName: string | null
  status: 'LIVE' | 'WITHERED'
  parentId: string | null
  publishedAt: string
  witheredAt: string | null
  childrenCount: number
}

interface TreeViewProps {
  iterationId: string
}

const nodeTypes = {
  custom: CustomNode,
}

export default function TreeView({ iterationId }: TreeViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateNodeSize = (childrenCount: number): { width: number; height: number } => {
    // Base size: 180x100
    // Scale up based on children count (up to a max)
    const scaleFactor = Math.min(1 + childrenCount * 0.1, 2)
    return {
      width: 180 * scaleFactor,
      height: 100 * scaleFactor,
    }
  }

  const calculateLayout = useCallback((treeNodes: TreeNode[]) => {
    // Build a map of node -> children for easy traversal
    const childrenMap = new Map<string, string[]>()
    const allNodeIds = new Set(treeNodes.map(n => n.id))

    treeNodes.forEach(node => {
      if (node.parentId && allNodeIds.has(node.parentId)) {
        if (!childrenMap.has(node.parentId)) {
          childrenMap.set(node.parentId, [])
        }
        childrenMap.get(node.parentId)!.push(node.id)
      }
    })

    // Find root nodes (nodes with no parent or parent not in this iteration)
    const rootNodes = treeNodes.filter(node => !node.parentId || !allNodeIds.has(node.parentId))

    // Layout algorithm: hierarchical tree layout
    const nodePositions = new Map<string, { x: number; y: number }>()
    const levelHeight = 280 // Increased for more vertical space
    const nodeSpacing = 250

    const layoutTree = (nodeId: string, level: number, offset: number): number => {
      const children = childrenMap.get(nodeId) || []

      if (children.length === 0) {
        // Leaf node
        nodePositions.set(nodeId, { x: offset, y: level * levelHeight })
        return offset + nodeSpacing
      }

      // Layout children first
      let childOffset = offset
      const childPositions: number[] = []

      children.forEach(childId => {
        const childX = childOffset
        childPositions.push(childX)
        childOffset = layoutTree(childId, level + 1, childOffset)
      })

      // Position parent at the center of its children
      const firstChildX = childPositions[0]
      const lastChildX = childPositions[childPositions.length - 1]
      const parentX = (firstChildX + lastChildX) / 2

      nodePositions.set(nodeId, { x: parentX, y: level * levelHeight })

      return childOffset
    }

    // Layout each root tree
    let currentOffset = 0
    rootNodes.forEach(root => {
      currentOffset = layoutTree(root.id, 0, currentOffset)
      currentOffset += nodeSpacing // Add extra space between separate trees
    })

    // Convert to React Flow nodes
    const flowNodes: Node[] = treeNodes.map(node => {
      const position = nodePositions.get(node.id) || { x: 0, y: 0 }
      const size = calculateNodeSize(node.childrenCount)

      return {
        id: node.id,
        type: 'custom',
        position,
        data: {
          content: node.content,
          authorName: node.authorName,
          status: node.status,
          publishedAt: node.publishedAt,
          childrenCount: node.childrenCount,
          width: size.width,
          height: size.height,
          nodeId: node.id,
        },
        style: {
          width: size.width,
          height: size.height,
        },
        draggable: false,
      }
    })

    // Create edges with simple straight lines
    const flowEdges: Edge[] = treeNodes
      .filter(node => node.parentId && allNodeIds.has(node.parentId))
      .map(node => {
        return {
          id: `${node.parentId}-${node.id}`,
          source: node.parentId!,
          target: node.id,
          type: 'straight',
          animated: false,
          style: {
            stroke: '#222222',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#222222',
          },
        }
      })

    return { flowNodes, flowEdges }
  }, [])

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/tree/${iterationId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch tree data')
        }

        const data = await response.json()
        const { flowNodes, flowEdges } = calculateLayout(data.nodes)

        setNodes(flowNodes)
        setEdges(flowEdges)
        setError(null)
      } catch (err) {
        console.error('Error loading tree:', err)
        setError('Failed to load tree visualization')
      } finally {
        setLoading(false)
      }
    }

    fetchTreeData()
  }, [iterationId, calculateLayout, setNodes, setEdges])

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-white border-2 border-foreground flex items-center justify-center">
        <div className="text-gray-mid">Loading tree visualization...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-white border-2 border-foreground flex items-center justify-center">
        <div className="text-foreground">{error}</div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[600px] bg-white border-2 border-foreground flex items-center justify-center">
        <div className="text-gray-mid">No nodes to display</div>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] bg-white border-2 border-foreground">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        defaultEdgeOptions={{
          type: 'straight',
        }}
      >
        <Background color="#aaaaaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={() => '#222222'}
        />
      </ReactFlow>
    </div>
  )
}
