'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  settings: {
    heroTitle: string
    heroSubtitle: string
    howItWorksTitle: string
    step1Title: string
    step1Description: string
    step2Title: string
    step2Description: string
    step3Title: string
    step3Description: string
    step4Title: string
    step4Description: string
    rulesTitle: string
    rule1: string
    rule2: string
    rule3: string
    rule4: string
    rule5: string
  }
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        router.refresh()
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-white p-6 rounded-lg shadow border border-gray-light">
        <h2 className="text-2xl font-serif text-foreground mb-4">Hero Section</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.heroTitle}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subtitle
            </label>
            <textarea
              value={formData.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-dark"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white p-6 rounded-lg shadow border border-gray-light">
        <h2 className="text-2xl font-serif text-foreground mb-4">How It Works Section</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={formData.howItWorksTitle}
              onChange={(e) => handleChange('howItWorksTitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-dark"
            />
          </div>

          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="border-t border-gray-light pt-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Step {num} Title
                </label>
                <input
                  type="text"
                  value={formData[`step${num}Title` as keyof typeof formData]}
                  onChange={(e) => handleChange(`step${num}Title`, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Step {num} Description
                </label>
                <textarea
                  value={formData[`step${num}Description` as keyof typeof formData]}
                  onChange={(e) => handleChange(`step${num}Description`, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-dark"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules Section */}
      <section className="bg-white p-6 rounded-lg shadow border border-gray-light">
        <h2 className="text-2xl font-serif text-foreground mb-4">Rules Section</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={formData.rulesTitle}
              onChange={(e) => handleChange('rulesTitle', e.target.value)}
              className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-dark"
            />
          </div>

          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num}>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rule {num}
              </label>
              <textarea
                value={formData[`rule${num}` as keyof typeof formData]}
                onChange={(e) => handleChange(`rule${num}`, e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-dark"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-6 py-3 border border-gray-light text-foreground rounded-lg hover:bg-background transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-purple-dark text-white rounded-lg hover:bg-foreground transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}
