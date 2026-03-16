'use client'

import { MonitorCard } from './monitor-card'
import { Monitor } from '@/types'
import { Ticket } from 'lucide-react'

interface MonitorListProps {
  monitors: Monitor[]
  onRemoved: (id: string) => void
}

export function MonitorList({ monitors, onRemoved }: MonitorListProps) {
  const active = monitors.filter((m) => m.status === 'active' || m.status === 'error')
  const done = monitors.filter((m) => m.status === 'notified' || m.status === 'stopped')

  if (monitors.length === 0) {
    return (
      <div className="border border-dashed border-border px-6 py-12 text-center flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center border border-border bg-muted">
          <Ticket className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold">No monitors yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Paste a BMS URL above to start watching for tickets.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {active.map((m) => (
        <MonitorCard key={m.id} monitor={m} onRemoved={onRemoved} />
      ))}

      {done.length > 0 && (
        <>
          {active.length > 0 && (
            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">Completed</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          {done.map((m) => (
            <MonitorCard key={m.id} monitor={m} onRemoved={onRemoved} />
          ))}
        </>
      )}
    </div>
  )
}
