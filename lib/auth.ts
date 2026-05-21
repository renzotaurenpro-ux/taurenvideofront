import { postPublic } from './api'
import type { UserProfile } from './authContext'

export function setSessionCookie(uid: string) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `__tauren_session=${uid}; path=/; max-age=86400; SameSite=Lax${secure}`
}

function parseProfile(data: unknown): UserProfile | null {
  if (!data || typeof data !== 'object') return null
  const raw = (data as { user?: unknown }).user ?? data
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = String(o.id ?? '')
  const email = String(o.email ?? '')
  const firstName = String(o.firstName ?? '')
  const lastName = String(o.lastName ?? '')
  const firebaseUid = String(o.firebaseUid ?? '')
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

export async function syncAuthLogin(idToken: string): Promise<UserProfile | null> {
  const res = await postPublic('/auth/login', { idToken })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  return parseProfile(data)
}

export async function registerAuthUser(body: Record<string, unknown>): Promise<void> {
  const res = await postPublic('/auth/register', body)
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(typeof data?.message === 'string' ? data.message : 'No se pudo completar el registro')
  }
}
