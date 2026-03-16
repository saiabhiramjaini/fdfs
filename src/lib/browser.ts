import { chromium } from 'playwright-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import type { Browser } from 'playwright'

// Apply stealth — masks headless indicators that Cloudflare detects
chromium.use(StealthPlugin())

let browser: Browser | null = null

/**
 * Returns a singleton Chromium browser instance.
 * Reuses the same browser across all checks — launching a new
 * browser per check would be very slow (~2-3s each time).
 */
export async function getBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) return browser

  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Required on Railway (low /dev/shm)
      '--disable-gpu',
    ],
  }) as unknown as Browser

  console.log('[browser] Chromium launched')
  return browser
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}
