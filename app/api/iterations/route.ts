import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createNewIteration } from '@/lib/iterations'

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('admin_authenticated')

    if (authCookie?.value !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, description } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const iteration = await createNewIteration(name, description)

    return NextResponse.json({ iteration })
  } catch (error) {
    console.error('Error creating iteration:', error)
    return NextResponse.json(
      { error: 'Failed to create iteration' },
      { status: 500 }
    )
  }
}
