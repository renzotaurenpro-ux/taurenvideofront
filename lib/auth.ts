import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from './firebase'
import { fetchAuth, postPublic } from './api'
import { SESSION_SEC } from './session'
import type { UserProfile } from './authContext'

export function setSessionCookie(uid: string) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `__tauren_session=${uid}; path=/; max-age=${SESSION_SEC}; SameSite=Lax${secure}`
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

export function profileFromFirebaseUser(user: User, fallbackEmail = ''): UserProfile {
  const name = user.displayName?.trim() ?? ''
  const parts = name ? name.split(/\s+/) : []
  return {
    id: user.uid,
    email: user.email ?? fallbackEmail,
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    role: 'USER',
    firebaseUid: user.uid,
  }
}

function backendMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string') {
    return (data as { message: string }).message
  }
  return fallback
}

export async function syncAuthLogin(idToken: string): Promise<UserProfile | null> {
  try {
    const res = await postPublic('/auth/login', { idToken })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const msg = backendMessage(data, '')
      if (res.status === 404 || msg === 'USER_NOT_FOUND') {
        throw new Error('No hay cuenta registrada. Regístrate primero')
      }
      return null
    }
    return parseProfile(data)
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('Regístrate')) throw e
    return null
  }
}

export async function fetchAuthProfile(user?: User | null): Promise<UserProfile | null> {
  try {
    const res = await fetchAuth('/auth/profile', {}, user)
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    return parseProfile(data)
  } catch {
    return null
  }
}

export async function waitForFirebaseUser(timeoutMs = 3000): Promise<void> {
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
