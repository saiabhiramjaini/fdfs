/**
 * Runs once when the Next.js server process starts.
 * Restores a polling loop for every monitor that was active in the DB.
 * Works on any persistent Node.js host (local, Railway, Render, Fly.io).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { restorePollers } = await import('./lib/poller')
    await restorePollers()
  }
}
