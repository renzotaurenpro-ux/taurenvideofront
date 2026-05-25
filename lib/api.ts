import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase'

const API_BASE = '/api/proxy'

function waitForAuthUser(timeoutMs = 8000): Promise<User> {
  const firebaseAuth = auth
  if (!firebaseAuth) return Promise.reject(new Error('UNAUTHENTICATED'))
  if (firebaseAuth.currentUser) return Promise.resolve(firebaseAuth.currentUser)
  return new Promise<User>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('UNAUTHENTICATED')), timeoutMs)
    const unsub = onAuthStateChanged(firebaseAuth, user => {
      if (user) {
        clearTimeout(timer)
        unsub()
        resolve(user)
      }
    })
  })
}

async function getToken(forceRefresh = false): Promise<string> {
  const user = await waitForAuthUser()
  const token = await user.getIdToken(forceRefresh)
  console.log('[api] token ok uid=' + user.uid.slice(0, 8) + ' refresh=' + forceRefresh)
  return token
}

const PURCHASE_CACHE_TTL = 10 * 60 * 1000
const PURCHASE_LS_KEY = '__scai_purchase_v1'

function lsGetPurchaseMap(): Record<string, { ts: number; purchased: boolean }> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(PURCHASE_LS_KEY) ?? '{}') } catch { return {} }
}

function lsSetPurchaseMap(map: Record<string, { ts: number; purchased: boolean }>) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(PURCHASE_LS_KEY, JSON.stringify(map)) } catch {}
}

export function getCachedPurchase(courseId: string): boolean | null {
  const map = lsGetPurchaseMap()
  const entry = map[courseId]
  if (!entry) return null
  if (Date.now() - entry.ts > PURCHASE_CACHE_TTL) return null
  return entry.purchased
}

export function setCachedPurchase(courseId: string, purchased: boolean) {
  const map = lsGetPurchaseMap()
  map[courseId] = { ts: Date.now(), purchased }
  lsSetPurchaseMap(map)
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

  console.log('[api] fetchAuth', options.method ?? 'GET', path)
  let res = await fetch(`${API_BASE}${path}`, { ...options, headers: makeHeaders(token) })
  console.log('[api] fetchAuth response', path, res.status)

  if (res.status === 401) {
    console.log('[api] 401 → refreshing token for', path)
    token = await getToken(true)
    res = await fetch(`${API_BASE}${path}`, { ...options, headers: makeHeaders(token) })
    console.log('[api] retry response', path, res.status)
  }

  return res
}

export async function fetchPublic(path: string): Promise<Response> {
  return fetch(`${API_BASE}${path}`)
}

export async function postPublic<T>(path: string, body: T): Promise<Response> {
  console.log('[api] postPublic', path)
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  console.log('[api] postPublic response', path, res.status)
  return res
}
