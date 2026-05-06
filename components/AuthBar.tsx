'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/authContext'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, UserCircle2, Settings, Award } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { CERT_PASSED_KEY } from '@/lib/certTest'

export default function AuthBar() {
  const { firebaseUser, profile, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [certUnlocked, setCertUnlocked] = useState(false)
  const showVerActions = pathname?.startsWith('/ver')

  useEffect(() => {
    if (loading || !firebaseUser || !showVerActions) return
    const sync = () => {
      try { setCertUnlocked(sessionStorage.getItem(CERT_PASSED_KEY) === '1') } catch { setCertUnlocked(false) }
    }
    sync()
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [loading, firebaseUser, showVerActions])

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
        {showVerActions && (
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/ver/test"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold text-white"
              style={{ background: 'var(--scai-teal)' }}
            >
              <Award size={14} />
              Realizar examen
            </Link>
            <Link
              href={certUnlocked ? '/certificado' : '/ver/test'}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold border"
              style={{
                background: certUnlocked ? 'rgba(18,180,198,0.16)' : 'rgba(255,255,255,0.05)',
                borderColor: certUnlocked ? 'rgba(18,180,198,0.35)' : 'rgba(255,255,255,0.12)',
                color: certUnlocked ? 'white' : 'rgba(255,255,255,0.55)',
              }}
            >
              <Award size={14} style={{ color: certUnlocked ? 'var(--scai-teal)' : 'rgba(255,255,255,0.35)' }} />
              Descargar certificado
            </Link>
          </div>
        )}
        <div className="[&_button]:h-8 [&_button]:w-8 [&_button]:min-h-0 [&_button]:rounded-lg [&_button]:border-white/12 [&_button]:bg-white/[0.06] [&_button]:text-white/70 [&_button]:hover:bg-white/10 [&_button]:hover:text-white [&>div]:h-8 [&>div]:w-8 [&>div]:min-h-0 [&>div]:rounded-lg [&>div]:border-white/12 [&>div]:bg-white/[0.06]">
          <ThemeToggle />
        </div>
        <span
          className="hidden sm:flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: 'rgba(18,180,198,0.15)', color: 'var(--scai-teal)' }}
        >
          <UserCircle2 size={10} />
          Sesión activa
        </span>
        <Link
          href="/ajustes"
          className="flex items-center gap-1 transition-colors"
          style={{ color: pathname === '/ajustes' ? 'var(--scai-teal)' : 'rgba(255,255,255,0.3)' }}
          title="Ajustes"
        >
          <Settings size={13} className={pathname === '/ajustes' ? 'rotate-45' : ''} style={{ transition: 'transform 0.3s' }} />
          <span className="hidden sm:inline text-[11px]">Ajustes</span>
        </Link>
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
