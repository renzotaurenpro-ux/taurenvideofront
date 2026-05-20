import { staticVideoMime, staticVideoPath } from './staticVideos'

export type PlaybackMode = 'static'

export function resolveLessonPlayback(
  mi: number,
  vi: number,
  getFile: (mi: number, vi: number) => string | undefined,
) {
  const file = getFile(mi, vi) ?? ''
  return {
    url: file ? staticVideoPath(file) : '',
    mime: file ? staticVideoMime(file) : 'video/mp4',
    key: `${mi}-${vi}-${file}`,
  }
}
