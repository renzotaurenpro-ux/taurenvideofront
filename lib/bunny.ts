export const BUNNY_LIBRARY_ID = '712047'

function asString(v: unknown): string | undefined {
  if (typeof v === 'string' && v.trim()) return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}

function pickString(raw: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const v = asString(raw[key])
    if (v) return v
  }
  return undefined
}

function unixExpires(value: unknown): string | undefined {
  if (value == null || value === '') return undefined
  if (typeof value === 'number' && Number.isFinite(value)) {
    const n = value > 1e12 ? Math.floor(value / 1000) : Math.floor(value)
    return n > 0 ? String(n) : undefined
  }
  const s = String(value).trim()
  if (/^\d+$/.test(s)) {
    const n = Number(s)
    const unix = n > 1e12 ? Math.floor(n / 1000) : n
    return unix > 0 ? String(unix) : undefined
  }
  const t = Date.parse(s)
  if (!Number.isFinite(t)) return undefined
  return String(Math.floor(t / 1000))
}

function bunnyIdFromCdnUrl(url?: string): string | undefined {
  if (!url) return undefined
  const m = url.match(/b-cdn\.net\/([a-f0-9-]{8,})(?:\/|$|\?)/i)
  return m?.[1]
}

function appendAuthParams(url: string, raw: Record<string, unknown>): string {
  const token = pickString(raw, ['token', 'embedToken', 'playbackToken', 'authToken', 'signedToken'])
  const expires = unixExpires(raw.expires ?? raw.tokenExpires ?? raw.expiresAt ?? raw.expiration)
  if (!token && !expires) return url
  try {
    const u = new URL(url)
    if (token) u.searchParams.set('token', token)
    if (expires) u.searchParams.set('expires', expires)
    return u.toString()
  } catch {
    return url
  }
}

export function bunnyEmbedUrl(url: string, autoplay = false): string {
  if (!url.includes('mediadelivery.net')) return url
  try {
    const u = new URL(url)
    u.searchParams.set('autoplay', autoplay ? 'true' : 'false')
    return u.toString()
  } catch {
    const flag = autoplay ? 'true' : 'false'
    const base = url.replace(/([?&])autoplay=(true|false|1|0)/gi, `$1autoplay=${flag}`)
    if (/[?&]autoplay=/i.test(base)) return base
    return `${base}${base.includes('?') ? '&' : '?'}autoplay=${flag}`
  }
}

export function bunnyEmbedNoAutoplay(url: string): string {
  return bunnyEmbedUrl(url, false)
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
    const fromCdn = bunnyIdFromCdnUrl(trimmed)
    if (fromCdn) return buildBunnyEmbedUrl(BUNNY_LIBRARY_ID, fromCdn)
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
  const nested = [raw.playback, raw.embed, raw.bunny, raw.stream]
    .find(v => v && typeof v === 'object') as Record<string, unknown> | undefined
  const src = nested ? { ...raw, ...nested } : raw

  const direct = pickString(src, [
    'url',
    'embedUrl',
    'embedURL',
    'playbackUrl',
    'hlsUrl',
    'src',
    'embed',
    'iframeUrl',
    'playerUrl',
    'watchUrl',
  ])
  const libraryId = pickString(src, ['libraryId', 'bunnyLibraryId', 'videoLibraryId']) ?? BUNNY_LIBRARY_ID
  const bunnyId = pickString(src, ['bunnyVideoId', 'bunnyId', 'videoGuid', 'guid', 'streamId'])
    ?? bunnyIdFromCdnUrl(pickString(src, ['thumbnailUrl', 'thumbnail', 'previewUrl']))

  const normalized = direct
    ? normalizeBunnyUrl(direct)
    : bunnyId
      ? buildBunnyEmbedUrl(libraryId, bunnyId)
      : undefined

  return normalized ? appendAuthParams(normalized, src) : undefined
}
