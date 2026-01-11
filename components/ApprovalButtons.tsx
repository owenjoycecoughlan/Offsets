'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApprovalButtonsProps {
  nodeId: string
}

export default function ApprovalButtons({ nodeId }: ApprovalButtonsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    if (!confirm('Approve this submission?')) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/nodes/${nodeId}/approve`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to approve')
      }

      alert('Node approved and published!')
      router.refresh()
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Reject this submission? This cannot be undone.')) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/nodes/${nodeId}/reject`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to reject')
      }

      alert('Node rejected')
      router.refresh()
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={isProcessing}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={isProcessing}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Reject
      </button>
    </div>
  )
}
