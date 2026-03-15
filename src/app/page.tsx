import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongoose'
import { MonitorModel } from '@/models/Monitor'
import { Monitor } from '@/types'
import { MonitorDashboard } from '@/components/monitor-dashboard'
import { UserMenu } from '@/components/user-menu'
import { CronStatus } from '@/components/cron-status'

export default async function HomePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  await connectDB()

  const docs = await MonitorModel.find({ userId: session.user.id })
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            <span className="font-semibold text-sm tracking-tight">BMS Notifier</span>
          </div>
          <UserMenu
            name={session.user.name}
            email={session.user.email}
            image={session.user.image}
          />
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Cron health pill */}
        <div className="mb-6">
          <CronStatus />
        </div>

        <MonitorDashboard
          defaultEmail={session.user.email ?? ''}
          initialMonitors={monitors}
        />
      </main>
    </div>
  )
}
