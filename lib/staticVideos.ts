const GITHUB_BASE = 'https://media.githubusercontent.com/media/renzotaurenpro-ux/taurenvideofront/main/public/videos'

export function staticVideoPath(file: string): string {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${GITHUB_BASE}/${encodeURIComponent(file)}`
  }
  return `/videos/${encodeURIComponent(file)}`
}

export function staticVideoMime(_file: string): string {
  return 'video/mp4'
}
