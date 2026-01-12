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
    // Base size: 280x140 (increased from 180x100 for more content visibility)
    // Scale up based on children count (up to a max)
    const scaleFactor = Math.min(1 + childrenCount * 0.1, 2)
    return {
      width: 280 * scaleFactor,
      height: 140 * scaleFactor,
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

    // Radial layout algorithm - nodes arranged in circles around root
    const nodePositions = new Map<string, { x: number; y: number }>()
    const nodeDepth = new Map<string, number>()

    // Calculate depth of each node (distance from root)
    const calculateDepth = (nodeId: string, depth: number) => {
      nodeDepth.set(nodeId, depth)
      const children = childrenMap.get(nodeId) || []
      children.forEach(childId => calculateDepth(childId, depth + 1))
    }

    // Set root depth and calculate all depths
    rootNodes.forEach(root => calculateDepth(root.id, 0))

    // Group nodes by depth
    const nodesByDepth = new Map<number, string[]>()
    treeNodes.forEach(node => {
      const depth = nodeDepth.get(node.id) || 0
      if (!nodesByDepth.has(depth)) {
        nodesByDepth.set(depth, [])
      }
      nodesByDepth.get(depth)!.push(node.id)
    })

    // Position nodes in concentric circles
    const radiusPerLevel = 500
    const centerX = 0
    const centerY = 0

    nodesByDepth.forEach((nodesAtDepth, depth) => {
      const radius = depth * radiusPerLevel
      const nodeCount = nodesAtDepth.length

      nodesAtDepth.forEach((nodeId, index) => {
        if (depth === 0) {
          // Root nodes at center
          const angle = (index / nodeCount) * 2 * Math.PI
          const rootRadius = nodeCount > 1 ? 200 : 0
          nodePositions.set(nodeId, {
            x: centerX + Math.cos(angle) * rootRadius,
            y: centerY + Math.sin(angle) * rootRadius
          })
        } else {
          // Arrange around parent's angle
          const node = treeNodes.find(n => n.id === nodeId)!
          const parentPos = node.parentId ? nodePositions.get(node.parentId) : null

          if (parentPos) {
            // Calculate angle based on parent position and siblings
            const siblings = childrenMap.get(node.parentId!) || []
            const siblingIndex = siblings.indexOf(nodeId)
            const siblingCount = siblings.length

            // Parent's angle from center
            const parentAngle = Math.atan2(parentPos.y - centerY, parentPos.x - centerX)

            // Spread children around parent's direction
            const spreadAngle = Math.PI / 3 // 60 degree spread
            const angleOffset = (siblingIndex - (siblingCount - 1) / 2) * (spreadAngle / Math.max(siblingCount - 1, 1))
            const angle = parentAngle + angleOffset

            nodePositions.set(nodeId, {
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius
            })
          } else {
            // Fallback: evenly space around circle
            const angle = (index / nodeCount) * 2 * Math.PI
            nodePositions.set(nodeId, {
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius
            })
          }
        }
      })
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

    // Create edges - simple lines connecting parent to child
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
        elementsSelectable={true}
        defaultEdgeOptions={{
          type: 'straight',
        }}
      >
        <Background color="#aaaaaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={() => '#222222'}
          pannable={true}
          zoomable={true}
        />
      </ReactFlow>
    </div>
  )
}
