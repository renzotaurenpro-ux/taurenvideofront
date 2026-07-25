import type { CourseEpisode } from './courses'
import { sortEpisodes } from './courses'
import { normalizeBunnyUrl } from './bunny'
import {
  PROGRAM_MODULO_TITLES,
  PROGRAM_SLOTS,
  matchProgramSlot,
  type ProgramSlot,
} from './program'
import { videoThumbnail } from './videoThumbnails'

export type LessonClip = {
  titulo: string
  duracion: string
  soon?: boolean
  id?: string
  order: number
  ponente?: string
  cargo?: string
  numero: number
  thumbnail?: string
}

export type LessonModulo = {
  titulo: string
  numero: number
  videos: LessonClip[]
}

function episodeUrl(ep: CourseEpisode): string | undefined {
  return normalizeBunnyUrl(ep.url)
}

function formatDuration(d: string | null | undefined): string {
  if (!d || !String(d).trim()) return '—'
  return String(d)
}

function scoreEpisodeForSlot(ep: CourseEpisode, slot: ProgramSlot): number {
  const title = ep.title || ''
  const matched = matchProgramSlot(title)
  if (matched?.numero === slot.numero) return 100 + (ep.order || 0)

  let score = 0
  for (const re of slot.match) {
    if (re.test(title)) score += 10
  }
  if (ep.order === slot.numero) score += 5
  return score
}

function pickEpisodeForSlot(
  slot: ProgramSlot,
  episodes: CourseEpisode[],
  used: Set<string>,
): CourseEpisode | null {
  let best: CourseEpisode | null = null
  let bestScore = 0
  for (const ep of episodes) {
    if (used.has(ep.id)) continue
    const score = scoreEpisodeForSlot(ep, slot)
    if (score > bestScore) {
      bestScore = score
      best = ep
    }
  }
  if (!best || bestScore < 10) return null
  used.add(best.id)
  return best
}

export function buildCourseLessons(episodes: CourseEpisode[]): {
  modulos: LessonModulo[]
  lessonMap: Record<string, string>
} {
  const sorted = sortEpisodes(episodes)
  const used = new Set<string>()
  const lessonMap: Record<string, string> = {}

  const clipsByModulo = new Map<number, LessonClip[]>()

  for (const slot of PROGRAM_SLOTS) {
    const ep = pickEpisodeForSlot(slot, sorted, used)
    const url = ep ? episodeUrl(ep) : undefined
    const clip: LessonClip = {
      id: ep?.id,
      numero: slot.numero,
      order: slot.numero,
      titulo: slot.titulo,
      ponente: slot.ponente,
      cargo: slot.cargo,
      duracion: ep ? formatDuration(ep.duration) : 'Próximamente',
      soon: !url,
      thumbnail: videoThumbnail(slot.numero),
    }
    const list = clipsByModulo.get(slot.modulo) ?? []
    list.push(clip)
    clipsByModulo.set(slot.modulo, list)
  }

  const moduloNums = [...clipsByModulo.keys()].sort((a, b) => a - b)
  const modulos: LessonModulo[] = moduloNums.map((numero, mi) => {
    const videos = clipsByModulo.get(numero) ?? []
    videos.forEach((clip, vi) => {
      if (!clip.id) return
      const ep = sorted.find(e => e.id === clip.id)
      const url = ep ? episodeUrl(ep) : undefined
      if (url) lessonMap[`${mi}-${vi}`] = url
    })
    return {
      numero,
      titulo: PROGRAM_MODULO_TITLES[numero] ?? `Módulo ${numero}`,
      videos,
    }
  })

  return { modulos, lessonMap }
}

export function buildLessonMapFromEpisodes(episodes: CourseEpisode[]): Record<string, string> {
  return buildCourseLessons(episodes).lessonMap
}

export function lessonPlaybackKey(mi: number, vi: number) {
  return `${mi}-${vi}`
}
