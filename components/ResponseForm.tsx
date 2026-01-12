'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
          className="w-full px-4 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-purple-dark focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-purple-dark focus:border-transparent font-serif resize-y"
          placeholder="Write your creative response here..."
          disabled={isSubmitting}
        />
        <p className="text-sm text-purple-muted mt-1">
          No length limit. Let your creativity flow.
        </p>
      </div>

      {error && (
        <div className="bg-purple-muted/20 border border-purple-dark text-purple-dark px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-foreground text-white py-3 px-6 border-2 border-foreground font-bold hover:bg-gray-mid disabled:bg-gray-light disabled:border-gray-light disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT CONTRIBUTION'}
      </button>

      <p className="text-sm text-purple-muted text-center">
        Your response will be reviewed and published once approved by the admin.
      </p>
    </form>
  )
}
