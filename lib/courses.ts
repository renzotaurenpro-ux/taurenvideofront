import type { User } from 'firebase/auth'
import { fetchAuth, fetchPublic } from './api'
import { normalizeBunnyUrl } from './bunny'
import { API_TIMEOUT_MS, SESSION_MS } from './session'

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

export type CourseAccessResult =
  | { ok: true; paid: true; course: Course }
  | { ok: true; paid: false }
  | { ok: false; unauthorized: true }
  | { ok: false; timeout: true }
  | { ok: false; error: true }

export const DEFAULT_COURSE_ID = 'scai-jornadas-2026'

const COURSES_CACHE_KEY = '__scai_courses_v1'

function episodePlaybackUrl(ep: CourseEpisode): string | undefined {
  return normalizeBunnyUrl(ep.url || ep.embedUrl || ep.playbackUrl)
}

function parseWatchCourse(data: unknown): Course | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Course
  if (!o.id) return null
  const videos: CourseEpisode[] = Array.isArray(o.videos)
    ? o.videos.map(v => ({ ...v, url: episodePlaybackUrl(v) }))
    : []
  return { ...o, videos }
}

export async function fetchCourses(): Promise<Course[]> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(COURSES_CACHE_KEY)
      if (raw) {
        const { ts, data } = JSON.parse(raw)
        if (Date.now() - ts < SESSION_MS && Array.isArray(data) && data.length > 0) {
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

export async function resolveCourseAccess(courseId: string, user?: User | null): Promise<CourseAccessResult> {
  const signal = AbortSignal.timeout(API_TIMEOUT_MS)
  try {
    const res = await fetchAuth(`/courses/${encodeURIComponent(courseId)}/watch`, { signal }, user)
    if (res.status === 401) return { ok: false, unauthorized: true }
    if (res.status === 403) return { ok: true, paid: false }
    if (!res.ok) return { ok: false, error: true }
    const data = await res.json().catch(() => null)
    const course = parseWatchCourse(data)
    if (!course) return { ok: true, paid: false }
    return { ok: true, paid: true, course }
  } catch (e: unknown) {
    const name = (e as { name?: string })?.name
    if (name === 'TimeoutError' || name === 'AbortError') return { ok: false, timeout: true }
    return { ok: false, error: true }
  }
}

export async function checkCoursePurchase(courseId: string, user?: User | null): Promise<boolean> {
  const result = await resolveCourseAccess(courseId, user)
  if (result.ok && result.paid) return true
  if (result.ok && !result.paid) return false
  return false
}

export async function fetchCourseWatch(courseId: string, user?: User | null): Promise<Course | null> {
  const result = await resolveCourseAccess(courseId, user)
  if (result.ok && result.paid) return result.course
  return null
}

export function sortEpisodes(episodes: CourseEpisode[]): CourseEpisode[] {
  return [...episodes].sort((a, b) => a.order - b.order)
}
