import mongoose from 'mongoose'

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithCache = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache
}

if (!globalWithCache._mongooseCache) {
  globalWithCache._mongooseCache = { conn: null, promise: null }
}

const cache = globalWithCache._mongooseCache

export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Please define MONGODB_URI in .env.local')

  if (cache.conn) return cache.conn

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri).then((m) => m)
  }

  cache.conn = await cache.promise
  return cache.conn
}
