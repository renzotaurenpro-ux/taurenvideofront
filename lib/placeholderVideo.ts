export const PLACEHOLDER_VIDEO_URL = '/videos/placeholder.mp4'

const PLACEHOLDER_KEYS = ['0-0', '0-1', '0-2']

export function buildPlaceholderLessonMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const k of PLACEHOLDER_KEYS) map[k] = PLACEHOLDER_VIDEO_URL
  return map
}
