import { lessonPlaybackKey } from './bunnyLessons'
import { staticVideoMime, staticVideoPath } from './staticVideos'

export function resolveLessonPlayback(
  mi: number,
  vi: number,
  bunnyMap: Record<string, string>,
  getFile?: (mi: number, vi: number) => string | undefined,
) {
  const key = lessonPlaybackKey(mi, vi)
  const embed = bunnyMap[key]
  if (embed) {
    const isEmbed = embed.includes('mediadelivery.net')
    return { url: embed, mime: 'video/mp4', key: `${key}-play`, isEmbed }
  }
  const file = getFile?.(mi, vi) ?? ''
  if (file) {
    return {
      url: staticVideoPath(file),
      mime: staticVideoMime(file),
      key: `${key}-${file}`,
      isEmbed: false,
    }
  }
  return { url: '', mime: 'video/mp4', key, isEmbed: false }
}
