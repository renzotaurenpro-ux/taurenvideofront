'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from './firebase'
import { fetchAuth } from './api'

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
}

const AuthContext = createContext<AuthContextValue | null>(null)

function cookieFlags() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
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

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (fbUser) {
        document.cookie = `__tauren_session=${fbUser.uid}; ${cookieFlags()}`

        try {
          const res = await fetchAuth('/auth/profile')
          if (res.ok) {
            const data: UserProfile = await res.json()
            setProfile(data)
            document.cookie = `__tauren_name=${encodeURIComponent(`${data.firstName} ${data.lastName}`)}; ${cookieFlags()}`
          }
        } catch {
        }
      } else {
        setProfile(null)
        clearSessionCookies()
      }

      setLoading(false)
    })

    return unsub
  }, [])

  async function logout() {
    if (auth) await signOut(auth)
    setProfile(null)
    clearSessionCookies()
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, profile, loading, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
