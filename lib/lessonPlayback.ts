import { staticVideoMime, staticVideoPath } from './staticVideos'

export function resolveLessonPlayback(
  mi: number,
  vi: number,
  getFile: (mi: number, vi: number) => string | undefined,
) {
  const file = getFile(mi, vi) ?? ''
  return {
    url: file ? staticVideoPath(file) : '',
    mime: staticVideoMime(file),
    key: `${mi}-${vi}-${file}`,
  }
}
