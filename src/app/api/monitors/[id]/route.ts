import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongoose'
import { MonitorModel } from '@/models/Monitor'
import { stopPolling } from '@/lib/poller'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await connectDB()

  // Ensure the monitor belongs to the requesting user
  const deleted = await MonitorModel.findOneAndDelete({
    _id: id,
    userId: session.user.email,
  })

  if (!deleted) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
  }

  // Kill the in-memory polling loop for this monitor
  stopPolling(id)

  return NextResponse.json({ success: true })
}
