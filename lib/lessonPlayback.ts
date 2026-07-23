import { lessonPlaybackKey } from './bunnyLessons'

export function resolveLessonPlayback(
  mi: number,
  vi: number,
  bunnyMap: Record<string, string>,
  _getFile?: (mi: number, vi: number) => string | undefined,
) {
  const key = lessonPlaybackKey(mi, vi)
  const embed = bunnyMap[key]
  if (embed) {
    const isEmbed = embed.includes('mediadelivery.net')
    return { url: embed, mime: 'video/mp4', key: `${key}-play`, isEmbed }
  }
  return { url: '', mime: 'video/mp4', key, isEmbed: false }
}
