import { fetchPublic } from './api'

export type BackendVideo = {
  id: string
  title: string
  description?: string
  published: boolean
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
