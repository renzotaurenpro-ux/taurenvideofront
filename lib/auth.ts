import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { fetchAuth, postPublic } from './api'
import type { UserProfile } from './authContext'

export function setSessionCookie(uid: string) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `__tauren_session=${uid}; path=/; max-age=86400; SameSite=Lax${secure}`
}

export function parseProfile(data: unknown): UserProfile | null {
  if (!data || typeof data !== 'object') return null
  const root = data as Record<string, unknown>
  const raw = root.user ?? root.data ?? root
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = String(o.id ?? o._id ?? '')
  const email = String(o.email ?? '')
  const firstName = String(o.firstName ?? o.first_name ?? '')
  const lastName = String(o.lastName ?? o.last_name ?? '')
  const firebaseUid = String(o.firebaseUid ?? o.firebase_uid ?? o.uid ?? '')
  if (!email && !firebaseUid && !id) return null
  return {
    id: id || firebaseUid,
    email,
    firstName,
    lastName,
    role: String(o.role ?? 'USER'),
    firebaseUid: firebaseUid || id,
    workplace: typeof o.workplace === 'string' ? o.workplace : undefined,
    medicalArea: typeof o.medicalArea === 'string' ? o.medicalArea : undefined,
    phoneNumber: typeof o.phoneNumber === 'string' ? o.phoneNumber : undefined,
    city: typeof o.city === 'string' ? o.city : undefined,
    rut: typeof o.rut === 'string' ? o.rut : undefined,
  }
}

function backendMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string') {
    return (data as { message: string }).message
  }
  return fallback
}

export async function syncAuthLogin(idToken: string): Promise<UserProfile | null> {
  for (let i = 0; i < 2; i++) {
    let res: Response
    try {
      console.log('[auth] syncAuthLogin attempt', i + 1)
      res = await postPublic('/auth/login', { idToken })
    } catch (e: any) {
      console.warn('[auth] syncAuthLogin network error:', e?.message)
      if (i === 0) { await new Promise(r => setTimeout(r, 400)); continue }
      return null
    }
    const data = await res.json().catch(() => null)
    console.log('[auth] syncAuthLogin status:', res.status, 'data:', JSON.stringify(data)?.slice(0, 120))
    if (!res.ok) {
      const msg = backendMessage(data, '')
      if (res.status === 404 || msg === 'USER_NOT_FOUND') {
        throw new Error('No hay cuenta registrada. Regístrate primero')
      }
      if (i === 0 && (res.status >= 500 || res.status === 408)) {
        await new Promise(r => setTimeout(r, 400))
        continue
      }
      return null
    }
    const profile = parseProfile(data)
    console.log('[auth] syncAuthLogin parseProfile:', profile ? 'ok email=' + profile.email : 'null')
    if (profile) return profile
    if (i === 0) { await new Promise(r => setTimeout(r, 300)); continue }
  }
  return null
}

export async function fetchAuthProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetchAuth('/auth/profile')
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    return parseProfile(data)
  } catch {
    return null
  }
}

export async function waitForFirebaseUser(timeoutMs = 8000): Promise<void> {
  const firebaseAuth = auth
  if (!firebaseAuth) throw new Error('Auth no disponible')
  if (firebaseAuth.currentUser) return
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Tiempo de espera agotado')), timeoutMs)
    const unsub = onAuthStateChanged(firebaseAuth, user => {
      if (user) {
        clearTimeout(timer)
        unsub()
        resolve()
      }
    })
  })
}

export async function registerAuthUser(body: Record<string, unknown>): Promise<void> {
  let res: Response
  try {
    res = await postPublic('/auth/register', body)
  } catch {
    throw new Error('No se pudo conectar con el servidor')
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(backendMessage(data, 'No se pudo completar el registro'))
  }
}
