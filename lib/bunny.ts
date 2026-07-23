export const BUNNY_LIBRARY_ID = '712047'

export function bunnyEmbedNoAutoplay(url: string): string {
  if (!url.includes('mediadelivery.net')) return url
  try {
    const u = new URL(url)
    u.searchParams.set('autoplay', 'false')
    return u.toString()
  } catch {
    const base = url.replace(/([?&])autoplay=(true|1)/gi, '$1autoplay=false')
    if (/[?&]autoplay=/i.test(base)) return base
    return `${base}${base.includes('?') ? '&' : '?'}autoplay=false`
  }
}

export function buildBunnyEmbedUrl(libraryId: string | number, videoId: string, query?: string): string {
  const q = query && query.length > 0 ? (query.startsWith('?') ? query : `?${query}`) : ''
  return bunnyEmbedNoAutoplay(`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}${q}`)
}

export function normalizeBunnyUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') return undefined
  const trimmed = url.trim()
  if (!trimmed) return undefined

  if (!trimmed.includes('mediadelivery.net')) {
    if (/^[a-f0-9-]{8,}$/i.test(trimmed)) {
      return buildBunnyEmbedUrl(BUNNY_LIBRARY_ID, trimmed)
    }
    const pair = trimmed.match(/^(\d+)\/([a-f0-9-]{8,})$/i)
    if (pair) return buildBunnyEmbedUrl(pair[1], pair[2])
    return trimmed.startsWith('http') ? trimmed : undefined
  }

  try {
    const u = new URL(trimmed)
    u.pathname = u.pathname
      .replace(/\/play\//i, '/embed/')
      .replace(/\/download\//i, '/embed/')
    if (u.hostname.includes('mediadelivery.net')) {
      u.searchParams.set('autoplay', 'false')
      return u.toString()
    }
  } catch {}

  const m = trimmed.match(/mediadelivery\.net\/(?:play|download|embed)\/(\d+)\/([a-f0-9-]+)/i)
  if (m) {
    const qIdx = trimmed.indexOf('?')
    const kept = qIdx >= 0 ? trimmed.slice(qIdx) : ''
    return buildBunnyEmbedUrl(m[1], m[2], kept)
  }

  return bunnyEmbedNoAutoplay(trimmed)
}

export function resolveEpisodePlaybackUrl(raw: Record<string, unknown>): string | undefined {
  if (typeof raw.url === 'string' && raw.url.trim()) {
    return normalizeBunnyUrl(raw.url)
  }
  return undefined
}
