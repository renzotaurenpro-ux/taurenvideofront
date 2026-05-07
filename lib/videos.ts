import { fetchPublic, fetchAuth } from './api'

export type BackendVideo = {
  id: string
  title: string
  description?: string
  published: boolean
  url?: string
  priceClp?: number
}

function normalizeBunnyUrl(url?: string): string | undefined {
  if (!url) return url
  const m = url.match(/mediadelivery\.net\/(?:play|download)\/(\d+)\/([a-f0-9-]+)/i)
  if (m) return `https://iframe.mediadelivery.net/embed/${m[1]}/${m[2]}`
  return url
}

const VIDEOS_CACHE_KEY = '__scai_videos_v1'
const VIDEOS_CACHE_TTL = 5 * 60 * 1000

export async function fetchPublishedVideos(): Promise<BackendVideo[]> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(VIDEOS_CACHE_KEY)
      if (raw) {
        const { ts, data } = JSON.parse(raw)
        if (Date.now() - ts < VIDEOS_CACHE_TTL && Array.isArray(data) && data.length > 0) {
          fetchPublishedVideos.__refresh().catch(() => {})
          return data
        }
      }
    } catch {}
  }
  return fetchPublishedVideos.__refresh()
}

fetchPublishedVideos.__refresh = async function (): Promise<BackendVideo[]> {
  try {
    const res = await fetchPublic('/videos')
    if (!res.ok) return []
    const data = await res.json()
    const videos: BackendVideo[] = Array.isArray(data) ? data : []
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(VIDEOS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: videos })) } catch {}
    }
    return videos
  } catch {
    return []
  }
} as () => Promise<BackendVideo[]>

export async function fetchVideoById(id: string): Promise<BackendVideo | null> {
  try {
    const res = await fetchAuth(`/videos/${id}`)
    if (!res.ok) return null
    const data = await res.json()
    return { ...data, url: normalizeBunnyUrl(data.url) }
  } catch {
    return null
  }
}

export async function fetchAdminVideos(): Promise<BackendVideo[]> {
  try {
    const res = await fetchAuth('/videos/admin/all')
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
