import type { CourseEpisode } from './courses'
import { sortEpisodes } from './courses'

function modulo1Order(title: string) {
  const t = title.toLowerCase()
  if (t.includes('primera')) return 0
  if (t.includes('segunda')) return 1
  if (t.includes('tercera')) return 2
  return 99
}

function pickModulo1Episodes(episodes: CourseEpisode[]) {
  const m1 = episodes.filter(v => /m[oó]dulo\s*1/i.test(v.title || ''))
  const sorted = [...m1].sort((a, b) => modulo1Order(a.title || '') - modulo1Order(b.title || ''))
  if (sorted.length >= 3) return sorted.slice(0, 3)
  return sortEpisodes(episodes).slice(0, 3)
}

export function buildLessonMapFromEpisodes(episodes: CourseEpisode[]): Record<string, string> {
  const map: Record<string, string> = {}
  const lessons = pickModulo1Episodes(episodes)
  lessons.forEach((ep, i) => {
    if (ep.url) map[`0-${i}`] = ep.url
  })
  return map
}

export function lessonPlaybackKey(mi: number, vi: number) {
  return `${mi}-${vi}`
}
