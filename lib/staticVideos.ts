const GITHUB_RAW = 'https://media.githubusercontent.com/media/renzotaurenpro-ux/taurenvideofront/main/public/videos'

export const VIDEO_FILES = {
  p1: 'Video Modulo 1 - Primera Clase.mp4',
  p2: 'Video Modulo 1  - Segunda Presentación.mov',
  p3: 'Video Modulo 1  - Tercera Presentación.mp4',
} as const

export function staticVideoPath(file: string): string {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${GITHUB_RAW}/${encodeURIComponent(file)}`
  }
  return `/videos/${encodeURIComponent(file)}`
}

export function staticVideoMime(file: string): string {
  const ext = file.split('.').pop()?.toLowerCase()
  if (ext === 'mp4') return 'video/mp4'
  if (ext === 'mov') return 'video/mp4'
  if (ext === 'webm') return 'video/webm'
  return 'video/mp4'
}
