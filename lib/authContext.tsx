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

function clearSessionCookies() {
  document.cookie = '__tauren_session=; path=/; max-age=0'
  document.cookie = '__tauren_name=; path=/; max-age=0'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        document.cookie = `__tauren_session=${fbUser.uid}; path=/; max-age=86400; SameSite=Strict`
        try {
          const res = await fetchAuth('/auth/profile')
          if (res.ok) {
            const data: UserProfile = await res.json()
            setProfile(data)
            const name = encodeURIComponent(`${data.firstName} ${data.lastName}`)
            document.cookie = `__tauren_name=${name}; path=/; max-age=86400; SameSite=Strict`
          } else {
            setProfile(null)
            document.cookie = '__tauren_name=; path=/; max-age=0'
          }
        } catch {
          setProfile(null)
          document.cookie = '__tauren_name=; path=/; max-age=0'
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
    await signOut(auth)
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
