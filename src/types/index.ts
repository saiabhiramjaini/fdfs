export type MonitorStatus = 'active' | 'notified' | 'stopped' | 'error'

// Serialized shape returned from API (all dates as ISO strings, _id as string)
export interface Monitor {
  id: string
  userId: string
  url: string
  notifyEmail: string
  status: MonitorStatus
  checkCount: number
  lastChecked?: string
  notifiedAt?: string
  lastError?: string
  createdAt: string
  updatedAt: string
}
