import { getBrowser } from './browser'

export interface CheckResult {
  available: boolean
  error?: string
}

/**
 * Uses a real headless Chromium browser (with stealth) to check if
 * a BMS date URL has tickets available.
 *
 * Why Chromium and not fetch():
 * BMS is protected by Cloudflare Bot Management. Plain fetch() — even with
 * perfect browser headers — gets 403. A real browser passes Cloudflare's
 * JavaScript challenge and renders the page like a human would.
 *
 * Detection logic:
 * - If the final URL still contains the date code → page loaded for that date
 * - Then check if any show-time elements are present in the DOM
 * - If redirected away from the date URL → tickets not open yet
 */
export async function checkAvailability(url: string): Promise<CheckResult> {
  const browser = await getBrowser()
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-IN',
  }) as Awaited<ReturnType<typeof browser.newContext>>

  const page = await context.newPage()

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })

    const finalUrl = page.url()
    const dateCode = url.split('/').pop() // e.g. "20260320"

    // If BMS redirected away from the date URL → not available yet
    if (!dateCode || !finalUrl.includes(dateCode)) {
      console.log(`[checker] Redirected away from ${dateCode} → not available`)
      return { available: false }
    }

    // Still on the right URL — check for show time text in the DOM
    // BMS renders time slots like "09:00 AM", "02:30 PM" etc.
    const showTimesCount = await page.locator('text=/\\d{1,2}:\\d{2} [AP]M/').count()

    if (showTimesCount > 0) {
      console.log(`[checker] Found ${showTimesCount} show time(s) → AVAILABLE`)
      return { available: true }
    }

    console.log(`[checker] On correct URL but no show times found → not available`)
    return { available: false }
  } catch (err) {
    return {
      available: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  } finally {
    await page.close()
    await context.close()
  }
}
