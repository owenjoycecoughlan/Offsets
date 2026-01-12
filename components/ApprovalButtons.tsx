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
    <div className="flex gap-4">
      <button
        onClick={handleApprove}
        disabled={isProcessing}
        className="px-6 py-3 bg-foreground text-white border-2 border-foreground font-bold hover:bg-gray-mid disabled:bg-gray-light disabled:border-gray-light disabled:cursor-not-allowed transition-colors"
      >
        APPROVE
      </button>
      <button
        onClick={handleReject}
        disabled={isProcessing}
        className="px-6 py-3 bg-white text-foreground border-2 border-foreground font-bold hover:bg-gray-light disabled:bg-gray-light disabled:cursor-not-allowed transition-colors"
      >
        REJECT
      </button>
    </div>
  )
}
