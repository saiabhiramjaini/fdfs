'use client'

import { useEffect, useState } from 'react'
import { timeAgo } from '@/lib/bms'

interface Status {
  lastRun: string | null
  totalActive: number
}

export function CronStatus() {
  const [status, setStatus] = useState<Status | null>(null)

  async function fetchStatus() {
    try {
      const res = await fetch('/api/cron/status')
      if (res.ok) setStatus(await res.json())
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetchStatus()
    const id = setInterval(fetchStatus, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!status) return null

  const neverRan = status.lastRun === null
  const stale = !neverRan && Date.now() - new Date(status.lastRun!).getTime() > 10 * 60 * 1000

  const dotColor = neverRan ? 'bg-yellow-400' : stale ? 'bg-red-500' : 'bg-emerald-500'
  const text = neverRan
    ? 'Cron: waiting for first run'
    : `Cron: last ran ${timeAgo(status.lastRun!)} · ${status.totalActive} active monitor${status.totalActive !== 1 ? 's' : ''}`

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${!neverRan && !stale ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  )
}
