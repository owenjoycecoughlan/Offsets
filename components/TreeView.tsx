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

    // Force-directed layout algorithm
    const nodePositions = new Map<string, { x: number; y: number }>()

    // Initialize positions: root at center, others radiating outward
    const centerX = 0
    const centerY = 0

    // Place root nodes at center
    rootNodes.forEach((root, index) => {
      const angle = (index / rootNodes.length) * 2 * Math.PI
      const radius = rootNodes.length > 1 ? 300 : 0
      nodePositions.set(root.id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      })
    })

    // Initialize other nodes in a circle around their parent
    treeNodes.forEach(node => {
      if (!nodePositions.has(node.id)) {
        if (node.parentId && nodePositions.has(node.parentId)) {
          const parentPos = nodePositions.get(node.parentId)!
          const siblings = childrenMap.get(node.parentId) || []
          const index = siblings.indexOf(node.id)
          const angle = (index / siblings.length) * 2 * Math.PI
          const radius = 400
          nodePositions.set(node.id, {
            x: parentPos.x + Math.cos(angle) * radius,
            y: parentPos.y + Math.sin(angle) * radius
          })
        } else {
          nodePositions.set(node.id, {
            x: centerX + (Math.random() - 0.5) * 1000,
            y: centerY + (Math.random() - 0.5) * 1000
          })
        }
      }
    })

    // Force simulation
    const iterations = 300
    const repulsionStrength = 50000
    const attractionStrength = 0.01
    const centeringForce = 0.001

    for (let i = 0; i < iterations; i++) {
      const forces = new Map<string, { x: number; y: number }>()

      // Initialize forces
      treeNodes.forEach(node => {
        forces.set(node.id, { x: 0, y: 0 })
      })

      // Repulsion between all nodes
      treeNodes.forEach(node1 => {
        treeNodes.forEach(node2 => {
          if (node1.id !== node2.id) {
            const pos1 = nodePositions.get(node1.id)!
            const pos2 = nodePositions.get(node2.id)!
            const dx = pos1.x - pos2.x
            const dy = pos1.y - pos2.y
            const distance = Math.sqrt(dx * dx + dy * dy) || 1
            const force = repulsionStrength / (distance * distance)
            const force1 = forces.get(node1.id)!
            force1.x += (dx / distance) * force
            force1.y += (dy / distance) * force
          }
        })
      })

      // Attraction along edges (parent-child connections)
      treeNodes.forEach(node => {
        if (node.parentId && allNodeIds.has(node.parentId)) {
          const childPos = nodePositions.get(node.id)!
          const parentPos = nodePositions.get(node.parentId)!
          const dx = parentPos.x - childPos.x
          const dy = parentPos.y - childPos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const force = distance * attractionStrength

          const childForce = forces.get(node.id)!
          childForce.x += dx * force
          childForce.y += dy * force

          const parentForce = forces.get(node.parentId)!
          parentForce.x -= dx * force
          parentForce.y -= dy * force
        }
      })

      // Centering force for root nodes
      rootNodes.forEach(root => {
        const pos = nodePositions.get(root.id)!
        const rootForce = forces.get(root.id)!
        rootForce.x -= pos.x * centeringForce
        rootForce.y -= pos.y * centeringForce
      })

      // Apply forces with damping
      const damping = 0.8
      treeNodes.forEach(node => {
        const pos = nodePositions.get(node.id)!
        const force = forces.get(node.id)!
        pos.x += force.x * damping
        pos.y += force.y * damping
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
