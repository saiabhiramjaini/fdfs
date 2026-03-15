import { connectDB } from './mongoose'
import { MonitorModel } from '@/models/Monitor'
import { checkAvailability } from './checker'
import { sendAvailabilityEmail } from './notifier'

// In-memory map: monitorId → interval handle
const pollers = new Map<string, NodeJS.Timeout>()

const INTERVAL_MS = parseInt(process.env.CHECK_INTERVAL_MS ?? '120000') // default 2 min

/** Check a single monitor once and update DB. Returns true if tickets found. */
async function checkOnce(monitorId: string): Promise<boolean> {
  await connectDB()
  const monitor = await MonitorModel.findById(monitorId)

  if (!monitor || monitor.status !== 'active') {
    stopPolling(monitorId)
    return false
  }

  const { available, error } = await checkAvailability(monitor.url)

  await MonitorModel.findByIdAndUpdate(monitorId, {
    $inc: { checkCount: 1 },
    lastChecked: new Date(),
    lastError: error ?? null,
    ...(error ? { status: 'error' } : {}),
  })

  if (available) {
    await sendAvailabilityEmail(monitor.notifyEmail, monitor.url)
    await MonitorModel.findByIdAndUpdate(monitorId, {
      status: 'notified',
      notifiedAt: new Date(),
    })
    stopPolling(monitorId)
    console.log(`[poller] ✓ ${monitorId} — tickets live! Notified ${monitor.notifyEmail}`)
    return true
  }

  console.log(`[poller] ✗ ${monitorId} — not available (check #${monitor.checkCount + 1})`)
  return false
}

export async function startPolling(monitorId: string): Promise<void> {
  if (pollers.has(monitorId)) return

  // Run immediately, then repeat on interval
  await checkOnce(monitorId)
  const timer = setInterval(() => checkOnce(monitorId), INTERVAL_MS)
  pollers.set(monitorId, timer)

  console.log(`[poller] Started loop for ${monitorId} — every ${INTERVAL_MS / 1000}s`)
}

export function stopPolling(monitorId: string): void {
  const timer = pollers.get(monitorId)
  if (timer) {
    clearInterval(timer)
    pollers.delete(monitorId)
    console.log(`[poller] Stopped loop for ${monitorId}`)
  }
}

/** One-time scan of all active monitors — used by the manual /api/cron trigger. */
export async function runChecks(): Promise<void> {
  await connectDB()
  const monitors = await MonitorModel.find({ status: 'active' })
  console.log(`[poller] Manual check — ${monitors.length} active monitor(s)`)
  for (const monitor of monitors) {
    await checkOnce(monitor._id.toString())
  }
}

export function activePollerCount(): number {
  return pollers.size
}

/** Called on server boot — restores loops for all active monitors from DB. */
export async function restorePollers(): Promise<void> {
  await connectDB()
  const monitors = await MonitorModel.find({ status: 'active' })
  console.log(`[poller] Restoring ${monitors.length} active monitor(s) from DB...`)
  for (const monitor of monitors) {
    await startPolling(monitor._id.toString())
  }
}
