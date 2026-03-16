'use client'

import { useEffect, useState } from 'react'
import { timeAgo } from '@/lib/bms'
import { Activity, AlertTriangle, Clock } from 'lucide-react'

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

  const Icon = neverRan ? Clock : stale ? AlertTriangle : Activity
  const dotBg = neverRan ? 'bg-secondary' : stale ? 'bg-primary' : 'bg-[#00cc00]'
  const text = neverRan
    ? 'Waiting for first run'
    : `Last check: ${timeAgo(status.lastRun!)} · ${status.totalActive} active monitor${status.totalActive !== 1 ? 's' : ''}`

  return (
    <div className="inline-flex items-center gap-2 border border-border bg-muted px-3 py-1.5 shadow-xs self-start">
      <div className={`h-2 w-2 border border-border ${dotBg} ${!neverRan && !stale ? 'animate-pulse' : ''}`} />
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-mono text-muted-foreground">{text}</span>
    </div>
  )
}
