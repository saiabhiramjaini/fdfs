import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { connectDB } from '@/lib/mongoose'
import { MonitorModel } from '@/models/Monitor'
import { Monitor } from '@/types'
import { MonitorDashboard } from '@/components/monitor-dashboard'
import { UserMenu } from '@/components/user-menu'
import { CronStatus } from '@/components/cron-status'
import { Ticket } from 'lucide-react'

export default async function HomePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center bg-primary border border-border">
              <Ticket className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm uppercase tracking-widest font-mono">BMS Notifier</span>
          </div>
          <UserMenu
            name={session.user.name}
            email={session.user.email}
            image={session.user.image}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 flex flex-col gap-6">
        <CronStatus />
        <MonitorDashboard
          defaultEmail={session.user.email ?? ''}
          initialMonitors={monitors}
        />
      </main>
    </div>
  )
}
