import mongoose, { Schema, Document, Types } from 'mongoose'
import { MonitorStatus } from '@/types'

export interface IMonitor extends Document {
  _id: Types.ObjectId
  userId: string
  url: string
  notifyEmail: string
  status: MonitorStatus
  checkCount: number
  lastChecked?: Date
  notifiedAt?: Date
  lastError?: string
  createdAt: Date
  updatedAt: Date
}

const MonitorSchema = new Schema<IMonitor>(
  {
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true },
    notifyEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'notified', 'stopped', 'error'],
      default: 'active',
    },
    checkCount: { type: Number, default: 0 },
    lastChecked: { type: Date },
    notifiedAt: { type: Date },
    lastError: { type: String },
  },
  { timestamps: true }
)

export const MonitorModel =
  mongoose.models.Monitor ?? mongoose.model<IMonitor>('Monitor', MonitorSchema)
