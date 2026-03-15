export interface CheckResult {
  available: boolean
  error?: string
}

/**
 * Checks if a BMS URL has tickets available.
 *
 * Strategy: fetch with redirect:'manual'.
 * - 3xx redirect → BMS is bouncing the date → tickets NOT available yet
 * - 200 → page loaded for that date → tickets are LIVE
 *
 * Note: This is the best approach without a headless browser.
 * BMS does server-side redirects for unavailable dates.
 */
export async function checkAvailability(url: string): Promise<CheckResult> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
    })

    if (response.status >= 300 && response.status < 400) {
      return { available: false }
    }

    if (response.status === 200) {
      return { available: true }
    }

    return { available: false, error: `Unexpected status: ${response.status}` }
  } catch (err) {
    return {
      available: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
