'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Step {
  title: string
  description: string
}

interface SettingsFormProps {
  settings: {
    heroTitle: string
    heroSubtitle: string
    howItWorksTitle: string
    steps: Step[]
    rulesTitle: string
    rules: string[]
    contributionHeading: string
    contributionWitheredMessage: string
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

  const updateStep = (index: number, field: 'title' | 'description', value: string) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData(prev => ({ ...prev, steps: newSteps }))
  }

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { title: '', description: '' }]
    }))
  }

  const removeStep = (index: number) => {
    if (formData.steps.length <= 1) {
      alert('You must have at least one step')
      return
    }
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules]
    newRules[index] = value
    setFormData(prev => ({ ...prev, rules: newRules }))
  }

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }))
  }

  const removeRule = (index: number) => {
    if (formData.rules.length <= 1) {
      alert('You must have at least one rule')
      return
    }
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div className={`p-4 border-2 ${
          message.type === 'success'
            ? 'bg-white text-foreground border-foreground'
            : 'bg-white text-foreground border-foreground'
        }`}>
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-white p-6 border-2 border-foreground">
        <h2 className="text-2xl font-bold text-foreground mb-4">Hero Section</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.heroTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, heroTitle: e.target.value }))}
              className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Subtitle
            </label>
            <textarea
              value={formData.heroSubtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white p-6 border-2 border-foreground">
        <h2 className="text-2xl font-bold text-foreground mb-4">How It Works Section</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={formData.howItWorksTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, howItWorksTitle: e.target.value }))}
              className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
            />
          </div>

          {formData.steps.map((step, index) => (
            <div key={index} className="border-2 border-gray-light p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-foreground">Step {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="px-3 py-1 bg-white text-foreground border-2 border-foreground font-bold hover:bg-gray-light transition-colors"
                >
                  REMOVE
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addStep}
            className="w-full px-6 py-3 bg-foreground text-white border-2 border-foreground font-bold hover:bg-gray-mid transition-colors"
          >
            ADD STEP
          </button>
        </div>
      </section>

      {/* Rules Section */}
      <section className="bg-white p-6 border-2 border-foreground">
        <h2 className="text-2xl font-bold text-foreground mb-4">Rules Section</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={formData.rulesTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, rulesTitle: e.target.value }))}
              className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
            />
          </div>

          {formData.rules.map((rule, index) => (
            <div key={index} className="border-2 border-gray-light p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-foreground">Rule {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="px-3 py-1 bg-white text-foreground border-2 border-foreground font-bold hover:bg-gray-light transition-colors"
                >
                  REMOVE
                </button>
              </div>
              <textarea
                value={rule}
                onChange={(e) => updateRule(index, e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addRule}
            className="w-full px-6 py-3 bg-foreground text-white border-2 border-foreground font-bold hover:bg-gray-mid transition-colors"
          >
            ADD RULE
          </button>
        </div>
      </section>

      {/* Contribution Page Section */}
      <section className="bg-white p-6 border-2 border-foreground">
        <h2 className="text-2xl font-bold text-foreground mb-4">Contribution Page</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Response Heading
            </label>
            <input
              type="text"
              value={formData.contributionHeading}
              onChange={(e) => setFormData(prev => ({ ...prev, contributionHeading: e.target.value }))}
              className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
              placeholder="Respond to this node"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              Withered Node Message
            </label>
            <textarea
              value={formData.contributionWitheredMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, contributionWitheredMessage: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border-2 border-foreground focus:outline-none focus:ring-2 focus:ring-gray-mid"
              placeholder="This node has withered and can no longer receive responses."
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-6 py-3 bg-white text-foreground border-2 border-foreground font-bold hover:bg-gray-light transition-colors"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-foreground text-white border-2 border-foreground font-bold hover:bg-gray-mid disabled:bg-gray-light disabled:border-gray-light disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </button>
      </div>
    </form>
  )
}
