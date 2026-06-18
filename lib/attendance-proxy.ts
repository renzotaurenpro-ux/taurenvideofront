import { getBackendUrl, PRODUCTION_BACKEND_URL } from './backend-url'

export async function forwardAttendance(path: string, init?: RequestInit) {
  const localBase = getBackendUrl()
  const bases = localBase === PRODUCTION_BACKEND_URL
    ? [localBase]
    : [localBase, PRODUCTION_BACKEND_URL]

  for (const base of bases) {
    try {
      const res = await fetch(`${base}/attendance/${path}`, {
        ...init,
        cache: 'no-store',
      })
      if (res.status !== 404) return res
    } catch {}
  }
  return null
}
