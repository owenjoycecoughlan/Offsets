import { NextRequest, NextResponse } from 'next/server'
import { getNodeAncestry } from '@/lib/nodes'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ancestry = await getNodeAncestry(id)

    return NextResponse.json({ ancestry })
  } catch (error) {
    console.error('Error fetching ancestry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ancestry' },
      { status: 500 }
    )
  }
}
