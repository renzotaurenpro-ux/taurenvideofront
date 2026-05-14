'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/authContext'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Settings, Award, Play } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { CERT_PASSED_KEY } from '@/lib/certTest'
import { warmupBackend } from '@/lib/api'

export default function AuthBar() {
  const { firebaseUser, profile, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [certUnlocked, setCertUnlocked] = useState(false)
  const showVerActions = pathname?.startsWith('/ver')

  useEffect(() => {
    if (!loading && firebaseUser) warmupBackend()
  }, [loading, firebaseUser])

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

  const initial = displayName[0]?.toUpperCase() ?? '?'

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 sm:px-6 py-2 gap-3">

        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
            style={{ background: 'var(--scai-teal)' }}
          >
            {initial}
          </div>
          <span className="truncate text-sm font-semibold text-foreground hidden sm:block">
            {displayName}
          </span>
          <span className="truncate text-sm font-semibold text-foreground sm:hidden">
            {profile ? profile.firstName : firebaseUser.email}
          </span>
          {profile?.medicalArea && (
            <span className="hidden md:block text-xs text-muted-foreground truncate">
              · {profile.medicalArea}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <Link
            href="/ver"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              pathname === '/ver' || pathname?.startsWith('/ver/')
                ? 'border-[rgba(18,180,198,0.45)] bg-[rgba(18,180,198,0.12)] text-foreground'
                : 'border-border bg-secondary/60 text-foreground hover:bg-secondary'
            }`}
          >
            <Play size={12} className="fill-current" style={{ color: 'var(--scai-teal)' }} />
            <span className="hidden sm:inline">Ir al video</span>
            <span className="sm:hidden">Video</span>
          </Link>

          {showVerActions && (
            <div className="hidden md:flex items-center gap-1.5">
              <Link
                href="/ver/test"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--scai-teal)' }}
              >
                <Award size={13} />
                Realizar examen
              </Link>
              <Link
                href={certUnlocked ? '/certificado' : '/ver/test'}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold border transition-colors ${
                  certUnlocked
                    ? 'border-[rgba(18,180,198,0.4)] bg-[rgba(18,180,198,0.1)] text-foreground hover:bg-[rgba(18,180,198,0.18)]'
                    : 'border-border bg-secondary/60 text-muted-foreground/60'
                }`}
              >
                <Award size={13} style={{ color: certUnlocked ? 'var(--scai-teal)' : undefined }} />
                Descargar certificado
              </Link>
            </div>
          )}

          <ThemeToggle />

          <span
            className="hidden sm:flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--scai-teal)' }}
          >
            Sesión activa
          </span>

          <Link
            href="/ajustes"
            className={`flex items-center gap-1 text-xs transition-colors ${
              pathname === '/ajustes' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Ajustes"
          >
            <Settings
              size={14}
              className={pathname === '/ajustes' ? 'rotate-45' : ''}
              style={{ transition: 'transform 0.3s' }}
            />
            <span className="hidden sm:inline">Ajustes</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>

      </div>
    </div>
  )
}
