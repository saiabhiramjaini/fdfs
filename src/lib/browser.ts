import { chromium } from 'playwright-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import type { Browser } from 'playwright'

// Apply stealth — masks headless indicators that Cloudflare detects
chromium.use(StealthPlugin())

let browser: Browser | null = null
let checksSinceLaunch = 0
const BROWSER_RESTART_AFTER = 50 // restart browser every 50 checks to free memory

/**
 * Returns a singleton Chromium browser instance.
 * Reuses the same browser across all checks — launching a new
 * browser per check would be very slow (~2-3s each time).
 * Auto-restarts every 50 checks to prevent memory accumulation.
 */
export async function getBrowser(): Promise<Browser> {
  // Restart browser periodically to free accumulated memory
  if (browser && checksSinceLaunch >= BROWSER_RESTART_AFTER) {
    console.log('[browser] Restarting Chromium to free memory...')
    await browser.close().catch(() => {})
    browser = null
    checksSinceLaunch = 0
  }

  if (browser && browser.isConnected()) {
    checksSinceLaunch++
    return browser
  }

  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Required on Railway (low /dev/shm)
      '--disable-gpu',
      '--js-flags=--max-old-space-size=256', // limit JS heap inside browser
    ],
  }) as unknown as Browser

  checksSinceLaunch = 1
  console.log('[browser] Chromium launched')
  return browser
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}
