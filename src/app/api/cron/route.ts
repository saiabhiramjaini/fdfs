import { NextRequest, NextResponse } from 'next/server'
import { runChecks } from '@/lib/poller'

/**
 * GET /api/cron
 *
 * Manual trigger — useful for testing or as a fallback external cron.
 * On a persistent server (Railway, local), polling runs automatically
 * via instrumentation.ts and this endpoint is not needed for normal operation.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await runChecks()

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() })
}
