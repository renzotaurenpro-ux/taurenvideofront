import { fetchVideoById, normalizeBunnyUrl, type BackendVideo } from './videos'

function modulo1Order(title: string) {
  const t = title.toLowerCase()
  if (t.includes('primera')) return 0
  if (t.includes('segunda')) return 1
  if (t.includes('tercera')) return 2
  return 99
}

function pickModulo1(videos: BackendVideo[]) {
  const m1 = videos.filter(v => /m[oó]dulo\s*1/i.test(v.title || ''))
  return [...m1].sort((a, b) => modulo1Order(a.title || '') - modulo1Order(b.title || '')).slice(0, 3)
}

export async function buildBunnyLessonMap(videos: BackendVideo[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  const lessons = pickModulo1(videos)
  await Promise.all(
    lessons.map(async (v, i) => {
      let url = normalizeBunnyUrl(v.url)
      if (!url && v.id) {
        const full = await fetchVideoById(v.id)
        url = normalizeBunnyUrl(full?.url)
      }
      if (url) map[`0-${i}`] = url
    }),
  )
  return map
}

export function lessonPlaybackKey(mi: number, vi: number) {
  return `${mi}-${vi}`
}
