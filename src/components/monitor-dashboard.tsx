'use client'

import { useEffect, useState, useCallback } from 'react'
import { Monitor } from '@/types'
import { MonitorForm } from './monitor-form'
import { MonitorList } from './monitor-list'

interface MonitorDashboardProps {
  defaultEmail: string
  initialMonitors: Monitor[]
}

export function MonitorDashboard({ defaultEmail, initialMonitors }: MonitorDashboardProps) {
  const [monitors, setMonitors] = useState<Monitor[]>(initialMonitors)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/monitors')
      if (res.ok) setMonitors(await res.json())
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    const id = setInterval(refresh, 15_000)
    return () => clearInterval(id)
  }, [refresh])

  function handleCreated(monitor: Monitor) {
    setMonitors((prev) => [monitor, ...prev])
  }

  function handleRemoved(id: string) {
    setMonitors((prev) => prev.filter((m) => m.id !== id))
  }

  const activeCount = monitors.filter((m) => m.status === 'active').length

  return (
    <div className="flex flex-col gap-8">
      <MonitorForm defaultEmail={defaultEmail} onCreated={handleCreated} />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm uppercase tracking-widest font-mono">Your Monitors</h2>
          {activeCount > 0 && (
            <span className="text-xs font-mono font-bold border border-border px-2 py-0.5 bg-[#00cc00] text-black">
              {activeCount} active
            </span>
          )}
        </div>
        <MonitorList monitors={monitors} onRemoved={handleRemoved} />
      </section>
    </div>
  )
}
