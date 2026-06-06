import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase'
import { API_TIMEOUT_MS, SESSION_MS } from './session'

const API_BASE = '/api/proxy'

function waitForAuthUser(timeoutMs = 4000): Promise<User> {
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

async function getToken(forceRefresh = false, user?: User | null): Promise<string> {
  const u = user ?? (await waitForAuthUser())
  return u.getIdToken(forceRefresh)
}

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
  if (Date.now() - entry.ts > SESSION_MS) return null
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

export async function fetchAuth(path: string, options: RequestInit = {}, user?: User | null): Promise<Response> {
  let token = await getToken(false, user)

  const makeHeaders = (t: string): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${t}`,
  })

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers: makeHeaders(token) })

  if (res.status === 401) {
    token = await getToken(true, user ?? auth?.currentUser)
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

export async function prefetchPurchase(courseId: string, user?: User | null): Promise<boolean> {
  try {
    const signal = AbortSignal.timeout(API_TIMEOUT_MS)
    const res = await fetchAuth(`/courses/${encodeURIComponent(courseId)}/watch`, { signal }, user)
    if (res.status === 401) return false
    const purchased = res.status === 200
    setCachedPurchase(courseId, purchased)
    return purchased
  } catch {
    return false
  }
}
