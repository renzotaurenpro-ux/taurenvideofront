'use client'

import { useAuth } from '@/lib/authContext'
import { useRouter } from 'next/navigation'
import { LogOut, UserCircle2 } from 'lucide-react'

export default function AuthBar() {
  const { firebaseUser, profile, loading, logout } = useAuth()
  const router = useRouter()

  if (loading || !firebaseUser) return null

  const displayName = profile
    ? `Dr. ${profile.firstName} ${profile.lastName}`
    : (firebaseUser.email ?? '')

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <div
      className="w-full z-50 flex items-center justify-between px-4 sm:px-6 py-1.5 text-xs"
      style={{
        background: 'rgba(10,22,35,0.97)',
        borderBottom: '1px solid rgba(18,180,198,0.18)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
          style={{ background: 'var(--scai-teal)' }}
        >
          {displayName[0]?.toUpperCase() ?? '?'}
        </div>
        <span className="truncate font-semibold text-white/80 hidden sm:block">
          {displayName}
        </span>
        <span className="truncate font-semibold text-white/80 sm:hidden">
          {profile ? `${profile.firstName}` : firebaseUser.email}
        </span>
        {profile?.medicalArea && (
          <span className="hidden md:block text-white/30 truncate">· {profile.medicalArea}</span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="hidden sm:flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: 'rgba(18,180,198,0.15)', color: 'var(--scai-teal)' }}
        >
          <UserCircle2 size={10} />
          Sesión activa
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-white/30 hover:text-white/70 transition-colors"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
