'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Monitor, MonitorStatus } from '@/types'
import { parseBmsUrl, timeAgo } from '@/lib/bms'

interface MonitorCardProps {
  monitor: Monitor
  onRemoved: (id: string) => void
}

const STATUS: Record<
  MonitorStatus,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    border: string
    dot: string
  }
> = {
  active:   { label: 'Watching',  variant: 'default',      border: 'border-l-emerald-500',  dot: 'bg-emerald-500 animate-pulse' },
  notified: { label: 'Notified',  variant: 'secondary',    border: 'border-l-blue-400',     dot: 'bg-blue-400' },
  stopped:  { label: 'Stopped',   variant: 'outline',      border: 'border-l-border',       dot: 'bg-muted-foreground' },
  error:    { label: 'Error',     variant: 'destructive',  border: 'border-l-destructive',  dot: 'bg-destructive' },
}

export function MonitorCard({ monitor, onRemoved }: MonitorCardProps) {
  const [busy, setBusy] = useState(false)
  const info = parseBmsUrl(monitor.url)
  const { label, variant, border, dot } = STATUS[monitor.status]

  async function handleRemove() {
    setBusy(true)
    try {
      const res = await fetch(`/api/monitors/${monitor.id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Could not remove monitor')
        return
      }
      toast.success(monitor.status === 'active' ? 'Monitor stopped' : 'Removed')
      onRemoved(monitor.id)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`rounded-lg border border-l-4 ${border} bg-card px-4 py-4 flex items-start justify-between gap-4`}>
      <div className="flex items-start gap-3 min-w-0">
        {/* Status dot */}
        <div className="mt-1.5 shrink-0">
          <span className={`block h-2 w-2 rounded-full ${dot}`} />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {info?.cinema ?? 'Unknown Cinema'}
            </span>
            <Badge variant={variant} className="text-xs px-1.5 py-0">
              {label}
            </Badge>
          </div>

          {info && (
            <span className="text-xs text-muted-foreground">
              {info.city} · {info.date}
            </span>
          )}

          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <span>{monitor.checkCount} checks</span>
            <span>·</span>
            <span>Last: {timeAgo(monitor.lastChecked)}</span>
            <span>·</span>
            <span className="truncate max-w-40">{monitor.notifyEmail}</span>
          </div>

          {monitor.status === 'notified' && monitor.notifiedAt && (
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              ✓ Email sent at {new Date(monitor.notifiedAt).toLocaleTimeString()}
            </p>
          )}

          {monitor.status === 'error' && monitor.lastError && (
            <p className="text-xs text-destructive mt-1 truncate max-w-sm">
              {monitor.lastError}
            </p>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={busy}
        className="shrink-0 text-muted-foreground hover:text-foreground text-xs h-7 px-2"
      >
        {busy ? '...' : monitor.status === 'active' ? 'Stop' : 'Remove'}
      </Button>
    </div>
  )
}
