'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './authContext'

export function useRequireAuth() {
  const { firebaseUser, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !firebaseUser) router.replace('/login')
  }, [loading, firebaseUser, router])

  return { firebaseUser, profile, loading, ready: !loading && !!firebaseUser }
}
