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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        try {
          const res = await fetchAuth('/auth/profile')
          if (res.ok) {
            const data = await res.json()
            setProfile(data)
          } else {
            setProfile(null)
          }
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function logout() {
    await signOut(auth)
    setProfile(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tauren-user-paid')
    }
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
