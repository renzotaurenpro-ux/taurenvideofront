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

export function isBrowserNativeVideo(file: string) {
  return file.toLowerCase().endsWith('.mp4') || file.toLowerCase().endsWith('.webm')
}
