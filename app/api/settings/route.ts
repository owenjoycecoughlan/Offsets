import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { updateSiteSettings } from '@/lib/settings'

export async function POST(request: Request) {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const data = await request.json()

    const updatedSettings = await updateSiteSettings(data)

    return NextResponse.json({ success: true, settings: updatedSettings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
