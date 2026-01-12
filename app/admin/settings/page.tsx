import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'
import { getSiteSettings } from '@/lib/settings'
import SettingsForm from '@/components/SettingsForm'
import Link from 'next/link'

export default async function AdminSettingsPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const settings = await getSiteSettings()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/admin" className="text-foreground hover:text-gray-mid underline">
            ← Back to admin
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Site Settings</h1>
          <p className="text-gray-mid">
            Edit the text that appears on the landing page. Add or remove steps and rules as needed.
          </p>
        </header>

        <SettingsForm settings={settings} />
      </main>
    </div>
  )
}
