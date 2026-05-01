import { fetchPublic, fetchAuth } from './api'

export type BackendVideo = {
  id: string
  title: string
  description?: string
  published: boolean
  url?: string
  priceClp?: number
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
    return await res.json()
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
