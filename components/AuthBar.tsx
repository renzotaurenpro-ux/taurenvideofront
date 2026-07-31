'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/authContext'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Settings, Award, Play, Menu, X } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { getCertPassedLocal, syncCertUnlocked } from '@/lib/certTest'

export default function AuthBar() {
  const { firebaseUser, profile, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [certUnlocked, setCertUnlocked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const showVerActions = pathname?.startsWith('/ver')
  const hideBar = pathname === '/login' || pathname === '/registro'

  useEffect(() => {
    if (loading || !firebaseUser || !showVerActions) return
    let cancelled = false
    setCertUnlocked(getCertPassedLocal())
    syncCertUnlocked()
      .then(v => { if (!cancelled) setCertUnlocked(v) })
      .catch(() => {})
    const onFocus = () => {
      syncCertUnlocked()
        .then(v => { if (!cancelled) setCertUnlocked(v) })
        .catch(() => {})
    }
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [loading, firebaseUser, showVerActions])

  if (hideBar || loading || !firebaseUser) return null

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
            prefetch={false}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              pathname === '/ver' || pathname?.startsWith('/ver/')
                ? 'border-[rgba(18,180,198,0.45)] bg-[rgba(18,180,198,0.12)] text-foreground'
                : 'border-border bg-secondary/60 text-foreground hover:bg-secondary'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            <Play size={12} className="fill-current" style={{ color: 'var(--scai-teal)' }} />
            <span className="hidden sm:inline">Ir al video</span>
            <span className="sm:hidden">Video</span>
          </Link>

          {showVerActions && (
            <div className="hidden md:flex items-center gap-1.5">
              <Link
                href="/ver/test"
                prefetch={false}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--scai-teal)' }}
              >
                <Award size={13} />
                Realizar examen
              </Link>
              <Link
                href={certUnlocked ? '/certificado' : '/ver/test'}
                prefetch={false}
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

          <div className="hidden sm:flex items-center gap-2">
            <Link
              href="/ajustes"
              prefetch={false}
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

          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className={`sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl border transition-colors ${
              menuOpen
                ? 'border-[rgba(18,180,198,0.45)] bg-[rgba(18,180,198,0.12)] text-foreground'
                : 'border-border bg-secondary/60 text-muted-foreground'
            }`}
            aria-label="Menú"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sesión activa</p>
                <p className="text-sm font-semibold truncate">{displayName}</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-border bg-secondary/60 text-muted-foreground"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {showVerActions && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/ver/test"
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white"
                  style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 24px rgba(18,180,198,0.18)' }}
                >
                  <Award size={14} />
                  Examen
                </Link>
                <Link
                  href={certUnlocked ? '/certificado' : '/ver/test'}
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold border ${
                    certUnlocked
                      ? 'border-[rgba(18,180,198,0.4)] bg-[rgba(18,180,198,0.1)] text-foreground'
                      : 'border-border bg-secondary/60 text-muted-foreground/60'
                  }`}
                >
                  <Award size={14} style={{ color: certUnlocked ? 'var(--scai-teal)' : undefined }} />
                  Certificado
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/ajustes"
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold border border-border bg-secondary/60 text-foreground"
              >
                <Settings size={14} />
                Ajustes
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold border border-border bg-secondary/60 text-foreground"
              >
                <LogOut size={14} />
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
