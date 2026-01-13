'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './Button'

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
      <Button
        onClick={handleApprove}
        disabled={isProcessing}
        variant="primary"
      >
        APPROVE
      </Button>
      <Button
        onClick={handleReject}
        disabled={isProcessing}
        variant="danger"
      >
        REJECT
      </Button>
    </div>
  )
}
