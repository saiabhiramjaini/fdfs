import { connectDB } from './mongoose'
import { MonitorModel } from '@/models/Monitor'
import { checkAvailability } from './checker'
import { sendAvailabilityEmail } from './notifier'

// In-memory map: monitorId → interval handle
const pollers = new Map<string, NodeJS.Timeout>()

const INTERVAL_MS = parseInt(process.env.CHECK_INTERVAL_MS ?? '120000') // default 2 min

// Concurrency limiter — at most 2 Chromium contexts open at the same time
const MAX_CONCURRENT = 2
let runningChecks = 0
const checkQueue: Array<() => void> = []

function acquireSlot(): Promise<void> {
  return new Promise((resolve) => {
    if (runningChecks < MAX_CONCURRENT) {
      runningChecks++
      resolve()
    } else {
      checkQueue.push(() => { runningChecks++; resolve() })
    }
  })
}

function releaseSlot(): void {
  const next = checkQueue.shift()
  if (next) {
    next()
  } else {
    runningChecks--
  }
}

/** Check a single monitor once and update DB. Returns true if tickets found. */
async function checkOnce(monitorId: string): Promise<boolean> {
  await connectDB()
  const monitor = await MonitorModel.findById(monitorId)

  // Stop only if deliberately stopped/notified — keep looping through transient errors
  if (!monitor || monitor.status === 'notified' || monitor.status === 'stopped') {
    stopPolling(monitorId)
    return false
  }

  await acquireSlot()
  const { available, error } = await checkAvailability(monitor.url).finally(releaseSlot)

  await MonitorModel.findByIdAndUpdate(monitorId, {
    $inc: { checkCount: 1 },
    lastChecked: new Date(),
    lastError: error ?? null,
    // Keep status 'active' even on errors so the loop continues
    status: error ? 'error' : 'active',
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
  // Restore both 'active' and 'error' monitors — errors are transient, keep trying
  const monitors = await MonitorModel.find({ status: { $in: ['active', 'error'] } })
  console.log(`[poller] Restoring ${monitors.length} monitor(s) from DB...`)
  for (const monitor of monitors) {
    await startPolling(monitor._id.toString())
  }
}
