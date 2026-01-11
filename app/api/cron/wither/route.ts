import { NextRequest, NextResponse } from 'next/server'
import { processWithering } from '@/lib/nodes'

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication to prevent unauthorized access
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const witheredCount = await processWithering()

    return NextResponse.json({
      success: true,
      witheredCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in withering cron:', error)
    return NextResponse.json(
      { error: 'Failed to process withering' },
      { status: 500 }
    )
  }
}
