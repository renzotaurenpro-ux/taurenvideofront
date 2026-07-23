import type { User } from 'firebase/auth'
import { fetchAuth, fetchPublic } from './api'
import { resolveEpisodePlaybackUrl } from './bunny'
import { API_TIMEOUT_MS, SESSION_MS } from './session'

export type CourseEpisode = {
  id: string
  title: string
  order: number
  duration: string | null
  url?: string
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

export const DEFAULT_COURSE_ID = 'e7d2b626-cf8e-4828-bd0b-d9e6f1505919'

const COURSES_CACHE_KEY = '__scai_courses_v5'

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null
}

export function titleSequenceNumber(title: string): number {
  const m = (title || '').trim().match(/^(\d{1,2})\b/)
  if (!m) return 0
  const n = parseInt(m[1], 10)
  return Number.isFinite(n) ? n : 0
}

export function moduloNumberFromTitle(title: string): number {
  const m = (title || '').match(/m[oó]dulo\s*(\d+)/i)
  if (!m) return 0
  const n = parseInt(m[1], 10)
  return Number.isFinite(n) ? n : 0
}

function parseOrder(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return 0
}

function normalizeDuration(value: unknown): string | null {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) {
    const secs = Math.max(0, Math.floor(value))
    if (secs <= 0) return null
    const m = Math.floor(secs / 60)
    const s = secs % 60
    if (m >= 60) {
      const h = Math.floor(m / 60)
      const rm = m % 60
      return rm > 0 ? `${h} h ${rm} min` : `${h} h`
    }
    return s > 0 ? `${m} min ${s} s` : `${m} min`
  }
  return String(value)
}

function normalizeEpisode(v: unknown): CourseEpisode | null {
  const o = asRecord(v)
  if (!o) return null
  const id = String(o.id ?? '')
  if (!id) return null
  const title = String(o.title ?? '')
  const orderRaw = parseOrder(o.order)
  const order = orderRaw > 0 ? orderRaw : (titleSequenceNumber(title) || 0)
  return {
    id,
    title,
    order,
    duration: normalizeDuration(o.duration),
    url: resolveEpisodePlaybackUrl(o),
  }
}

function extractVideoList(raw: Record<string, unknown>): unknown[] {
  if (Array.isArray(raw.videos)) return raw.videos
  if (Array.isArray(raw.episodes)) return raw.episodes
  return []
}

function extractVideos(raw: Record<string, unknown>): CourseEpisode[] {
  return sortEpisodes(
    extractVideoList(raw).map(normalizeEpisode).filter((v): v is CourseEpisode => !!v),
  )
}

function parseCoursePayload(data: unknown): Course | null {
  const root = asRecord(data)
  if (!root) return null
  const o = asRecord(root.course) ?? asRecord(root.data) ?? root
  const id = String(o.id ?? root.courseId ?? '')
  if (!id) return null
  return {
    id,
    title: String(o.title ?? ''),
    description: String(o.description ?? ''),
    thumbnailUrl: o.thumbnailUrl == null ? null : String(o.thumbnailUrl),
    priceClp: typeof o.priceClp === 'number' ? o.priceClp : Number(o.priceClp) || 0,
    published: o.published !== false,
    videos: extractVideos(o),
  }
}

export function sortEpisodes(episodes: CourseEpisode[]): CourseEpisode[] {
  return [...episodes].sort((a, b) => {
    const sa = titleSequenceNumber(a.title) || a.order
    const sb = titleSequenceNumber(b.title) || b.order
    if (sa !== sb) return sa - sb
    if (a.order !== b.order) return a.order - b.order
    return a.title.localeCompare(b.title, 'es', { numeric: true, sensitivity: 'base' })
  })
}

export async function fetchCourses(): Promise<Course[]> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(COURSES_CACHE_KEY)
      if (raw) {
        const { ts, data } = JSON.parse(raw)
        if (Date.now() - ts < SESSION_MS && Array.isArray(data) && data.length > 0) {
          fetchCourses.__refresh().catch(() => {})
          return (data as Course[]).map(c => ({
            ...c,
            videos: sortEpisodes(Array.isArray(c.videos) ? c.videos.map(ep => ({ ...ep, url: undefined })) : []),
          }))
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
    const raw: unknown[] = Array.isArray(data)
      ? data
      : (Array.isArray((data as { courses?: unknown[] })?.courses) ? (data as { courses: unknown[] }).courses : [])
    const published = raw
      .map(parseCoursePayload)
      .filter((c): c is Course => !!c && c.published !== false)
      .map(c => ({
        ...c,
        videos: sortEpisodes(c.videos.map(ep => ({ ...ep, url: undefined }))),
      }))
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
  return courses.find(c => c.id === DEFAULT_COURSE_ID) ?? courses[0] ?? null
}

export async function resolveCourseAccess(courseId: string, user?: User | null): Promise<CourseAccessResult> {
  const signal = AbortSignal.timeout(API_TIMEOUT_MS)
  try {
    const res = await fetchAuth(`/courses/${encodeURIComponent(courseId)}/watch`, { signal }, user)
    if (res.status === 401) return { ok: false, unauthorized: true }
    if (res.status === 403) return { ok: true, paid: false }
    if (!res.ok) return { ok: false, error: true }
    const data = await res.json().catch(() => null)
    const course = parseCoursePayload(data)
    if (!course) return { ok: true, paid: false }
    return { ok: true, paid: true, course: { ...course, videos: sortEpisodes(course.videos) } }
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
