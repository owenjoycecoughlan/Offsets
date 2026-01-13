'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from './Button'

interface ResponseFormProps {
  parentId: string
}

export default function ResponseForm({ parentId }: ResponseFormProps) {
  const router = useRouter()
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!authorName.trim() || !content.trim()) {
      setError('Please fill in both your name and your response.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentId,
          authorName: authorName.trim(),
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit response')
      }

      // Success - show confirmation and reset form
      alert('Your response has been submitted and is awaiting approval!')
      setAuthorName('')
      setContent('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="authorName" className="block text-sm font-medium text-foreground mb-1">
          Your name (will be revealed when your node withers)
        </label>
        <input
          type="text"
          id="authorName"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full px-4 py-2 bg-background text-foreground border-2 border-gray-light focus:border-teal focus:outline-none"
          placeholder="Jane Doe"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-foreground mb-1">
          Your response
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full px-4 py-2 bg-background text-foreground border-2 border-gray-light focus:border-teal focus:outline-none font-serif resize-y"
          placeholder="Write your creative response here..."
          disabled={isSubmitting}
        />
        <p className="text-sm text-gray-mid mt-1">
          No length limit. Let your creativity flow.
        </p>
      </div>

      {error && (
        <div className="border-2 border-red-border text-foreground px-4 py-3" style={{ backgroundColor: '#3a3a3a' }}>
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        variant="primary"
        fullWidth
      >
        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT CONTRIBUTION'}
      </Button>

      <p className="text-sm text-gray-mid text-center">
        Your response will be reviewed and published once approved by the admin.
      </p>
    </form>
  )
}
