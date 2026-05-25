'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from './firebase'
import { fetchAuth } from './api'
import { parseProfile } from './auth'

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  firebaseUid: string
  workplace?: string
  medicalArea?: string
  phoneNumber?: string
  city?: string
  rut?: string
}

type AuthContextValue = {
  firebaseUser: User | null
  profile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
  setProfile: (p: UserProfile | null) => void
  cacheProfile: (uid: string, p: UserProfile) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const CACHE_KEY = '__tauren_profile_v1'
const CACHE_TTL = 45 * 60 * 1000

export function cacheProfileToStorage(uid: string, profile: UserProfile) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ uid, profile, ts: Date.now() }))
  } catch {}
}

function loadProfileFromStorage(uid: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.uid !== uid) return null
    if (Date.now() - parsed.ts > CACHE_TTL) return null
    return parsed.profile
  } catch { return null }
}

function clearProfileStorage() {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}

function cookieFlags() {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  return `path=/; max-age=86400; SameSite=Lax${secure}`
}

function clearSessionCookies() {
  const flags = `path=/; max-age=0; SameSite=Lax`
  document.cookie = `__tauren_session=; ${flags}`
  document.cookie = `__tauren_name=; ${flags}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        document.cookie = `__tauren_session=${fbUser.uid}; ${cookieFlags()}`

        const cached = loadProfileFromStorage(fbUser.uid)
        if (cached) {
          setProfile(cached)
          document.cookie = `__tauren_name=${encodeURIComponent(`${cached.firstName} ${cached.lastName}`)}; ${cookieFlags()}`
        }

        setLoading(false)

        fetchAuth('/auth/profile')
          .then(r => (r.ok ? r.json() : null))
          .then(data => {
            const p = parseProfile(data)
            if (!p) return
            setProfile(p)
            cacheProfileToStorage(fbUser.uid, p)
            document.cookie = `__tauren_name=${encodeURIComponent(`${p.firstName} ${p.lastName}`)}; ${cookieFlags()}`
          })
          .catch(() => {})
      } else {
        setProfile(null)
        clearSessionCookies()
        clearProfileStorage()
        setLoading(false)
      }
    })

    return unsub
  }, [])

  async function logout() {
    if (auth) await signOut(auth)
    setProfile(null)
    clearSessionCookies()
    clearProfileStorage()
  }

  function cacheProfile(uid: string, p: UserProfile) {
    setProfile(p)
    cacheProfileToStorage(uid, p)
    document.cookie = `__tauren_name=${encodeURIComponent(`${p.firstName} ${p.lastName}`)}; ${cookieFlags()}`
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, logout, setProfile, cacheProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
