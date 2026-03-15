/**
 * Parse a BMS cinema URL into a human-readable label.
 *
 * Example input:
 *   https://in.bookmyshow.com/cinemas/hyderabad/allu-cinemas-kokapet/buytickets/ALUC/20260321
 *
 * Example output:
 *   { cinema: "Allu Cinemas Kokapet", date: "21 Mar 2026", city: "Hyderabad" }
 */
export interface BmsInfo {
  cinema: string
  date: string
  city: string
}

export function parseBmsUrl(url: string): BmsInfo | null {
  try {
    const { pathname } = new URL(url)
    const parts = pathname.split('/').filter(Boolean)
    // ["cinemas", "hyderabad", "allu-cinemas-kokapet", "buytickets", "ALUC", "20260321"]

    const city = parts[1]
    const cinemaSlug = parts[2]
    const dateStr = parts[5]

    if (!city || !cinemaSlug || !dateStr || dateStr.length !== 8) return null

    const cinema = cinemaSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    const cityLabel = city.charAt(0).toUpperCase() + city.slice(1)

    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    const date = new Date(`${year}-${month}-${day}`)
    const formatted = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    return { cinema, date: formatted, city: cityLabel }
  } catch {
    return null
  }
}

export function timeAgo(iso?: string): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}
