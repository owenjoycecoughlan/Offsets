'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewIterationButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!confirm('This will end the current iteration and start a new one. All current LIVE nodes will be archived. Are you sure?')) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/iterations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) {
        throw new Error('Failed to create iteration')
      }

      alert('New iteration created successfully!')
      setIsOpen(false)
      setName('')
      setDescription('')
      router.refresh()
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-background text-teal border-2 border-teal font-bold hover:bg-teal hover:text-background transition-colors"
      >
        Start New Iteration
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-serif text-foreground mb-4">Start New Iteration</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Iteration Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-purple-dark focus:border-transparent"
              placeholder="e.g., Iteration 2, Spring 2025"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-purple-dark focus:border-transparent"
              placeholder="Brief description of this iteration"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-background text-teal py-2 px-4 border-2 border-teal font-bold hover:bg-teal hover:text-background disabled:bg-gray-light disabled:border-gray-light disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border-2 border-yellow-border text-foreground font-bold hover:bg-gray-light transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
