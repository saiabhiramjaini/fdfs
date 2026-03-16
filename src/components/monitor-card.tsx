'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Monitor, MonitorStatus } from '@/types'
import { parseBmsUrl, timeAgo } from '@/lib/bms'
import { RefreshCw, CheckCircle2, CircleOff, AlertCircle, Mail, Square } from 'lucide-react'

interface MonitorCardProps {
  monitor: Monitor
  onRemoved: (id: string) => void
}

const STATUS: Record<
  MonitorStatus,
  {
    label: string
    borderClass: string
    tagBg: string
    tagText: string
    Icon: React.ComponentType<{ className?: string }>
    spin?: boolean
  }
> = {
  active: {
    label: 'Watching',
    borderClass: 'border-l-[#00cc00]',
    tagBg: 'bg-[#00cc00]',
    tagText: 'text-black',
    Icon: RefreshCw,
    spin: true,
  },
  notified: {
    label: 'Notified',
    borderClass: 'border-l-[#0066ff]',
    tagBg: 'bg-[#0066ff]',
    tagText: 'text-white',
    Icon: CheckCircle2,
  },
  stopped: {
    label: 'Stopped',
    borderClass: 'border-l-muted-foreground',
    tagBg: 'bg-muted',
    tagText: 'text-muted-foreground',
    Icon: CircleOff,
  },
  error: {
    label: 'Error',
    borderClass: 'border-l-primary',
    tagBg: 'bg-primary',
    tagText: 'text-primary-foreground',
    Icon: AlertCircle,
  },
}

export function MonitorCard({ monitor, onRemoved }: MonitorCardProps) {
  const [busy, setBusy] = useState(false)
  const info = parseBmsUrl(monitor.url)
  const { label, borderClass, tagBg, tagText, Icon, spin } = STATUS[monitor.status]

  async function handleRemove() {
    setBusy(true)
    try {
      const res = await fetch(`/api/monitors/${monitor.id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Could not remove monitor'); return }
      toast.success(monitor.status === 'active' ? 'Monitor stopped' : 'Removed')
      onRemoved(monitor.id)
    } catch {
      toast.error('Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`border border-l-4 ${borderClass} border-border bg-card shadow-xs flex items-start justify-between gap-4 px-4 py-4`}>
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {/* Title + status tag */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm tracking-tight">
            {info?.cinema ?? 'Unknown Cinema'}
          </span>
          <span className={`inline-flex items-center gap-1 px-1.5 py-px text-xs font-bold uppercase tracking-wider border border-border font-mono ${tagBg} ${tagText}`}>
            <Icon className={`h-3 w-3 ${spin ? 'animate-spin' : ''}`} />
            {label}
          </span>
        </div>

        {/* Location + date */}
        {info && (
          <span className="text-xs text-muted-foreground font-mono">
            {info.city} · {info.date}
          </span>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap mt-0.5">
          <span className="font-mono">{monitor.checkCount} checks</span>
          <span>·</span>
          <span>Last: {timeAgo(monitor.lastChecked)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-40">{monitor.notifyEmail}</span>
          </span>
        </div>

        {monitor.status === 'notified' && monitor.notifiedAt && (
          <p className="text-xs font-bold text-[#0066ff] mt-0.5">
            Email sent at {new Date(monitor.notifiedAt).toLocaleTimeString()}
          </p>
        )}

        {monitor.status === 'error' && monitor.lastError && (
          <p className="text-xs text-primary mt-0.5 truncate max-w-sm">
            {monitor.lastError}
          </p>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRemove}
        disabled={busy}
        className="shrink-0 text-xs h-7 px-3 gap-1.5 font-mono"
      >
        {busy ? (
          <RefreshCw className="h-3 w-3 animate-spin" />
        ) : monitor.status === 'active' ? (
          <>
            <Square className="h-3 w-3" />
            Stop
          </>
        ) : (
          'Remove'
        )}
      </Button>
    </div>
  )
}
