import { auth } from './firebase'

const API_BASE = '/api/proxy'

async function getToken(forceRefresh = false): Promise<string> {
  if (!auth) throw new Error('UNAUTHENTICATED')
  const user = auth.currentUser
  if (!user) throw new Error('UNAUTHENTICATED')
  return user.getIdToken(forceRefresh)
}

const PURCHASE_CACHE_TTL = 2 * 60 * 1000
const purchaseCache = new Map<string, { ts: number; purchased: boolean }>()

export function getCachedPurchase(courseId: string): boolean | null {
  const entry = purchaseCache.get(courseId)
  if (!entry) return null
  if (Date.now() - entry.ts > PURCHASE_CACHE_TTL) { purchaseCache.delete(courseId); return null }
  return entry.purchased
}

export function setCachedPurchase(courseId: string, purchased: boolean) {
  purchaseCache.set(courseId, { ts: Date.now(), purchased })
}

let warmupDone = false
export function warmupBackend() {
  if (warmupDone) return
  warmupDone = true
  fetch(`${API_BASE}/courses`).catch(() => {})
}

export async function fetchAuth(path: string, options: RequestInit = {}): Promise<Response> {
  let token = await getToken()

  const makeHeaders = (t: string): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${t}`,
  })

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers: makeHeaders(token) })

  if (res.status === 401) {
    token = await getToken(true)
    res = await fetch(`${API_BASE}${path}`, { ...options, headers: makeHeaders(token) })
  }

  return res
}

export async function fetchPublic(path: string): Promise<Response> {
  return fetch(`${API_BASE}${path}`)
}

export async function postPublic<T>(path: string, body: T): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
