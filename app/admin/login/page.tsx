'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-foreground mb-2">Admin Login</h1>
          <p className="text-gray-mid">Enter password to access admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 border border-gray-light" style={{ backgroundColor: '#3a3a3a' }}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-background text-foreground border-2 border-gray-light focus:border-teal focus:outline-none"
              placeholder="Enter admin password"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 border-2 border-red-border text-foreground px-4 py-3" style={{ backgroundColor: '#2b2b2b' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-background text-teal py-3 px-6 border-2 border-teal font-bold hover:bg-teal hover:text-background disabled:bg-gray-light disabled:border-gray-light disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-teal hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
