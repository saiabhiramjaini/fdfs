import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongoose'
import { MonitorModel } from '@/models/Monitor'
import { startPolling } from '@/lib/poller'
import { Monitor } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  const docs = await MonitorModel.find({ userId: session.user.email })
    .sort({ createdAt: -1 })
    .lean()

  const monitors: Monitor[] = docs.map((doc) => ({
    id: (doc._id as { toString(): string }).toString(),
    userId: doc.userId,
    url: doc.url,
    notifyEmail: doc.notifyEmail,
    status: doc.status as Monitor['status'],
    checkCount: doc.checkCount,
    lastChecked: doc.lastChecked?.toISOString(),
    notifiedAt: doc.notifiedAt?.toISOString(),
    lastError: doc.lastError,
    createdAt: (doc.createdAt as Date).toISOString(),
    updatedAt: (doc.updatedAt as Date).toISOString(),
  }))

  return NextResponse.json(monitors)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { url, notifyEmail } = body

  if (!url || !notifyEmail) {
    return NextResponse.json({ error: 'url and notifyEmail are required' }, { status: 400 })
  }

  if (!url.includes('bookmyshow.com')) {
    return NextResponse.json({ error: 'Please enter a valid BookMyShow URL' }, { status: 400 })
  }

  await connectDB()

  const doc = await MonitorModel.create({
    userId: session.user.email,
    url,
    notifyEmail,
    status: 'active',
    checkCount: 0,
  })

  const monitorId = doc._id.toString()

  // Start the infinite polling loop for this monitor
  startPolling(monitorId)

  const monitor: Monitor = {
    id: monitorId,
    userId: doc.userId,
    url: doc.url,
    notifyEmail: doc.notifyEmail,
    status: doc.status as Monitor['status'],
    checkCount: doc.checkCount,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }

  return NextResponse.json(monitor, { status: 201 })
}
