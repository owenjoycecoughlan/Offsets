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

    // Radial layout with angle sector allocation
    const nodePositions = new Map<string, { x: number; y: number }>()
    const centerX = 0
    const centerY = 0
    const radiusPerLevel = 500

    // Count total descendants for each node (for angle allocation)
    const descendantCount = new Map<string, number>()
    const countDescendants = (nodeId: string): number => {
      const children = childrenMap.get(nodeId) || []
      if (children.length === 0) return 1
      const count = children.reduce((sum, childId) => sum + countDescendants(childId), 0)
      descendantCount.set(nodeId, count)
      return count
    }

    rootNodes.forEach(root => countDescendants(root.id))

    // Allocate angle sectors recursively
    const layoutSubtree = (nodeId: string, depth: number, startAngle: number, endAngle: number) => {
      const radius = depth * radiusPerLevel
      const angle = (startAngle + endAngle) / 2

      nodePositions.set(nodeId, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      })

      const children = childrenMap.get(nodeId) || []
      if (children.length === 0) return

      // Allocate angle range to children based on their descendant counts
      const totalDescendants = descendantCount.get(nodeId) || 1
      let currentAngle = startAngle

      children.forEach(childId => {
        const childDescendants = descendantCount.get(childId) || 1
        const angleShare = (endAngle - startAngle) * (childDescendants / totalDescendants)
        const childEndAngle = currentAngle + angleShare

        layoutSubtree(childId, depth + 1, currentAngle, childEndAngle)
        currentAngle = childEndAngle
      })
    }

    // Layout each root tree with equal angle sectors
    if (rootNodes.length === 1) {
      // Single root at center with children spreading 360 degrees
      nodePositions.set(rootNodes[0].id, { x: centerX, y: centerY })
      const children = childrenMap.get(rootNodes[0].id) || []
      const totalDescendants = descendantCount.get(rootNodes[0].id) || children.length
      let currentAngle = 0

      children.forEach(childId => {
        const childDescendants = descendantCount.get(childId) || 1
        const angleShare = (2 * Math.PI) * (childDescendants / totalDescendants)
        const childEndAngle = currentAngle + angleShare

        layoutSubtree(childId, 1, currentAngle, childEndAngle)
        currentAngle = childEndAngle
      })
    } else {
      // Multiple roots: divide circle equally
      const anglePerRoot = (2 * Math.PI) / rootNodes.length
      rootNodes.forEach((root, index) => {
        const startAngle = index * anglePerRoot
        const endAngle = (index + 1) * anglePerRoot
        layoutSubtree(root.id, 0, startAngle, endAngle)
      })
    }

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

    // Create edges - straight lines that intelligently connect between nodes
    const flowEdges: Edge[] = treeNodes
      .filter(node => node.parentId && allNodeIds.has(node.parentId))
      .map(node => {
        const parentPos = nodePositions.get(node.parentId!)
        const childPos = nodePositions.get(node.id)

        if (!parentPos || !childPos) {
          return {
            id: `${node.parentId}-${node.id}`,
            source: node.parentId!,
            target: node.id,
            type: 'straight',
            animated: false,
            style: { stroke: '#f4e4a6', strokeWidth: 2 },
          }
        }

        // Calculate which side of each node to connect to
        const dx = childPos.x - parentPos.x
        const dy = childPos.y - parentPos.y

        // Determine source handle (where line leaves parent)
        let sourceHandle: string
        if (Math.abs(dx) > Math.abs(dy)) {
          sourceHandle = dx > 0 ? 'right' : 'left'
        } else {
          sourceHandle = dy > 0 ? 'bottom' : 'top'
        }

        // Determine target handle (where line enters child)
        let targetHandle: string
        if (Math.abs(dx) > Math.abs(dy)) {
          targetHandle = dx > 0 ? 'left' : 'right'
        } else {
          targetHandle = dy > 0 ? 'top' : 'bottom'
        }

        return {
          id: `${node.parentId}-${node.id}`,
          source: node.parentId!,
          target: node.id,
          sourceHandle,
          targetHandle,
          type: 'straight',
          animated: false,
          style: {
            stroke: '#f4e4a6',
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
      <div className="w-full h-[600px] bg-background border-2 border-yellow-border flex items-center justify-center">
        <div className="text-gray-mid">Loading tree visualization...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-background border-2 border-yellow-border flex items-center justify-center">
        <div className="text-foreground">{error}</div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-[600px] bg-background border-2 border-yellow-border flex items-center justify-center">
        <div className="text-gray-mid">No nodes to display</div>
      </div>
    )
  }

  return (
    <div className="w-full h-[600px] bg-background border-2 border-yellow-border">
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
        <Background color="#666666" gap={16} />
        <Controls
          showZoom={true}
          showFitView={false}
          showInteractive={false}
          position="bottom-left"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            const nodeData = node.data as { status: 'LIVE' | 'WITHERED' }
            return nodeData.status === 'LIVE' ? '#b8e994' : '#e89b9b'
          }}
          maskColor="rgba(102, 102, 102, 0.5)"
          style={{
            backgroundColor: '#2b2b2b',
          }}
          pannable={true}
          zoomable={true}
        />
      </ReactFlow>
    </div>
  )
}
