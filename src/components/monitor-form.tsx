'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Monitor } from '@/types'
import { Plus, Loader2 } from 'lucide-react'

interface MonitorFormProps {
  defaultEmail: string
  onCreated: (monitor: Monitor) => void
}

export function MonitorForm({ defaultEmail, onCreated }: MonitorFormProps) {
  const [url, setUrl] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(defaultEmail)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, notifyEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create monitor')
        return
      }
      toast.success("Monitor started — we'll email you when tickets drop.")
      onCreated(data as Monitor)
      setUrl('')
    } catch {
      toast.error('Something went wrong. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-border bg-card shadow">
      {/* Card header */}
      <div className="border-b border-border px-5 py-4 bg-muted flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm uppercase tracking-widest font-mono">New Monitor</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Change the date in the BMS URL to your target day, then paste it below.
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center border border-border bg-primary">
          <Plus className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="url" className="text-xs font-bold uppercase tracking-widest font-mono">
            BookMyShow URL
          </Label>
          <Input
            id="url"
            type="url"
            placeholder="https://in.bookmyshow.com/cinemas/hyderabad/.../20260321"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            Open any working date on BMS, then swap the 8-digit date at the end of the URL.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notifyEmail" className="text-xs font-bold uppercase tracking-widest font-mono">
            Notify Email
          </Label>
          <Input
            id="notifyEmail"
            type="email"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            One email the moment tickets go live.
          </p>
        </div>

        <div>
          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Start Monitoring
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
