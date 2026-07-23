const GITHUB_BASE = 'https://media.githubusercontent.com/media/renzotaurenpro-ux/taurenvideofront/main/public/videos'

const STATIC_BY_ORDER: Record<number, string> = {
  1: 'Video Modulo 1 - Primera Clase.mp4',
  2: 'Video Modulo 1  - Segunda Presentación.mov',
  3: 'Video Modulo 1  - Tercera Presentación.mp4',
}

const STATIC_LESSONS: { match: RegExp; file: string; order: number }[] = [
  { match: /primera/i, file: STATIC_BY_ORDER[1], order: 1 },
  { match: /segunda/i, file: STATIC_BY_ORDER[2], order: 2 },
  { match: /tercera/i, file: STATIC_BY_ORDER[3], order: 3 },
]

export function staticVideoPath(file: string): string {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${GITHUB_BASE}/${encodeURIComponent(file)}`
  }
  return `/videos/${encodeURIComponent(file)}`
}

export function staticVideoMime(file: string): string {
  const lower = file.toLowerCase()
  if (lower.endsWith('.mov')) return 'video/quicktime'
  if (lower.endsWith('.webm')) return 'video/webm'
  return 'video/mp4'
}

export function resolveStaticLessonFile(title: string, order?: number): string | undefined {
  const t = title || ''
  for (const row of STATIC_LESSONS) {
    if (row.match.test(t)) return row.file
  }
  if (order && STATIC_BY_ORDER[order]) return STATIC_BY_ORDER[order]
  return undefined
}
