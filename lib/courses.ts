import { fetchAuth, fetchPublic } from './api'
import { normalizeBunnyUrl } from './bunny'

export type CourseEpisode = {
  id: string
  title: string
  order: number
  duration: string | null
  url?: string
  playbackUrl?: string
  embedUrl?: string
}

export type Course = {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  priceClp: number
  published: boolean
  videos: CourseEpisode[]
}

const COURSES_CACHE_KEY = '__scai_courses_v1'
const COURSES_CACHE_TTL = 5 * 60 * 1000

function episodePlaybackUrl(ep: CourseEpisode): string | undefined {
  return normalizeBunnyUrl(ep.url || ep.embedUrl || ep.playbackUrl)
}

export async function fetchCourses(): Promise<Course[]> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(COURSES_CACHE_KEY)
      if (raw) {
        const { ts, data } = JSON.parse(raw)
        if (Date.now() - ts < COURSES_CACHE_TTL && Array.isArray(data) && data.length > 0) {
          fetchCourses.__refresh().catch(() => {})
          return data
        }
      }
    } catch {}
  }
  return fetchCourses.__refresh()
}

fetchCourses.__refresh = async function (): Promise<Course[]> {
  try {
    const res = await fetchPublic('/courses')
    if (!res.ok) return []
    const data = await res.json()
    const courses: Course[] = Array.isArray(data) ? data : []
    const published = courses.filter(c => c.published !== false)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(COURSES_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: published }))
      } catch {}
    }
    return published
  } catch {
    return []
  }
} as () => Promise<Course[]>

export async function fetchPublishedCourse(): Promise<Course | null> {
  const courses = await fetchCourses()
  return courses[0] ?? null
}

export async function checkCoursePurchase(courseId: string, signal?: AbortSignal): Promise<boolean> {
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetchAuth(`/purchases/check/course/${courseId}`, { signal })
      if (res.ok) {
        const data = await res.json()
        return data.purchased === true || data.hasPurchase === true || data.hasAccess === true
      }
      if (res.status >= 500 && i === 0) {
        await new Promise(r => setTimeout(r, 500))
        continue
      }
      return false
    } catch (e) {
      if (signal?.aborted) return false
      if (i === 0) {
        await new Promise(r => setTimeout(r, 500))
        continue
      }
      return false
    }
  }
  return false
}

export async function fetchCourseWatch(courseId: string): Promise<Course | null> {
  try {
    const res = await fetchAuth(`/courses/${courseId}/watch`)
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.id) return null
    const videos: CourseEpisode[] = Array.isArray(data.videos)
      ? data.videos.map((v: CourseEpisode) => ({
          ...v,
          url: episodePlaybackUrl(v),
        }))
      : []
    return { ...data, videos }
  } catch {
    return null
  }
}

export function sortEpisodes(episodes: CourseEpisode[]): CourseEpisode[] {
  return [...episodes].sort((a, b) => a.order - b.order)
}
