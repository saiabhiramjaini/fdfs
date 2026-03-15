'use client'

import { MonitorCard } from './monitor-card'
import { Monitor } from '@/types'

interface MonitorListProps {
  monitors: Monitor[]
  onRemoved: (id: string) => void
}

export function MonitorList({ monitors, onRemoved }: MonitorListProps) {
  const active = monitors.filter((m) => m.status === 'active' || m.status === 'error')
  const done = monitors.filter((m) => m.status === 'notified' || m.status === 'stopped')

  if (monitors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
        <p className="text-2xl mb-2">🎟️</p>
        <p className="text-sm font-medium text-foreground">No monitors yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add a BMS URL above to start watching for tickets.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {active.map((m) => (
        <MonitorCard key={m.id} monitor={m} onRemoved={onRemoved} />
      ))}

      {done.length > 0 && (
        <>
          {active.length > 0 && (
            <div className="flex items-center gap-3 my-1">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Completed</span>
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
