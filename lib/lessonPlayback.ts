import { MODULE1_FILES, lessonFile, staticVideoMime, staticVideoPath } from './staticVideos'

export type PlaybackMode = 'pending' | 'static' | 'embed'

export function embedLessonUrl(base: string, mi: number, vi: number) {
  if (!base) return base
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}lesson=${mi}-${vi}`
}

export function resolveLessonPlayback(
  mi: number,
  vi: number,
  mode: PlaybackMode,
  bunnyEmbed: string,
  getFile?: (mi: number, vi: number) => string | undefined,
) {
  const file = lessonFile(mi, vi, getFile?.(mi, vi))
  const key = `${mi}-${vi}`
  if (mode === 'embed' && bunnyEmbed) {
    return {
      url: embedLessonUrl(bunnyEmbed, mi, vi),
      mime: 'video/mp4',
      key: `${key}-embed`,
      isEmbed: true,
    }
  }
  return {
    url: staticVideoPath(file),
    mime: staticVideoMime(file),
    key: `${key}-${file}`,
    isEmbed: false,
  }
}

export async function probeStaticVideos(): Promise<boolean> {
  try {
    const r = await fetch(staticVideoPath(MODULE1_FILES[0]), { method: 'HEAD', cache: 'no-store' })
    const len = parseInt(r.headers.get('content-length') || '0', 10)
    return r.ok && len > 500000
  } catch {
    return false
  }
}
