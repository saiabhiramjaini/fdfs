import { NextRequest, NextResponse } from 'next/server'
import { checkAvailability } from '@/lib/checker'

// GET /api/debug?url=<bms-url>
// Tests the full Playwright-based check and returns the result
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Pass ?url=...' }, { status: 400 })

  console.log(`[debug] Checking: ${url}`)
  const result = await checkAvailability(url)

  return NextResponse.json({ url, ...result })
}
