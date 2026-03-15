'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Monitor } from '@/types'

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
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">New Monitor</CardTitle>
        <CardDescription className="text-sm">
          Change the date in the BMS URL to your target day, then paste it below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url" className="text-sm font-medium">
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
              Tip: Go to any working date on BMS, then change the 8-digit date in the URL.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notifyEmail" className="text-sm font-medium">
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
              We&apos;ll send one email the moment tickets go live.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-fit mt-1">
            {loading ? 'Starting...' : 'Start Monitoring'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
