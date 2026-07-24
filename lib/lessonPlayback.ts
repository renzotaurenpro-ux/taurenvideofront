import { lessonPlaybackKey } from './bunnyLessons'

export function resolveLessonPlayback(
  mi: number,
  vi: number,
  bunnyMap: Record<string, string>,
) {
  const key = lessonPlaybackKey(mi, vi)
  const embed = bunnyMap[key]
  if (!embed) return { url: '', mime: 'video/mp4', key, isEmbed: false }
  return {
    url: embed,
    mime: 'video/mp4',
    key: `${key}-play`,
    isEmbed: embed.includes('mediadelivery.net'),
  }
}
