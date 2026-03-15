import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongoose'
import { MonitorModel } from '@/models/Monitor'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  // Find the most recently checked monitor across ALL monitors (not just this user's)
  // This tells us when the cron last ran globally
  const lastCheckedDoc = await MonitorModel.findOne(
    { lastChecked: { $exists: true } },
    { lastChecked: 1 }
  ).sort({ lastChecked: -1 })

  // Count active monitors (all users)
  const totalActive = await MonitorModel.countDocuments({ status: 'active' })

  return NextResponse.json({
    lastRun: lastCheckedDoc?.lastChecked?.toISOString() ?? null,
    totalActive,
  })
}
