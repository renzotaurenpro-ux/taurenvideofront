export const MODULE1_FILES = [
  'Video Modulo 1 - Primera Clase.mp4',
  'Video Modulo 1  - Segunda Presentación.mov',
  'Video Modulo 1  - Tercera Presentación.mp4',
] as const

export function staticVideoPath(file: string) {
  return `/videos/${encodeURIComponent(file)}`
}

export function staticVideoMime(file: string) {
  const ext = file.split('.').pop()?.toLowerCase()
  if (ext === 'mp4') return 'video/mp4'
  if (ext === 'mov') return 'video/quicktime'
  if (ext === 'webm') return 'video/webm'
  return 'video/mp4'
}

export function lessonFile(moduloIdx: number, videoIdx: number, explicit?: string) {
  if (explicit) return explicit
  return MODULE1_FILES[videoIdx % MODULE1_FILES.length]
}
