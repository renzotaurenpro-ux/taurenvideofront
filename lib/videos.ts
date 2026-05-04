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

export async function fetchPublishedVideos(): Promise<BackendVideo[]> {
  try {
    const res = await fetchPublic('/videos')
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

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
