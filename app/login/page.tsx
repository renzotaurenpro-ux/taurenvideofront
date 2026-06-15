'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Home } from 'lucide-react'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, hasFirebaseConfig } from '@/lib/firebase'
import { useAuth } from '@/lib/authContext'
import { setSessionCookie, syncAuthLogin, profileFromFirebaseUser } from '@/lib/auth'
import { warmupBackend, prefetchPurchase } from '@/lib/api'
import { fetchPublishedCourse } from '@/lib/courses'
import PageBackground from '@/components/PageBackground'

export default function LoginPage() {
  const router = useRouter()
  const { cacheProfile, firebaseUser, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    warmupBackend()
  }, [])

  useEffect(() => {
    if (!authLoading && firebaseUser) router.replace('/ver')
  }, [authLoading, firebaseUser, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Completa todos los campos')
      return
    }
    if (!hasFirebaseConfig() || !auth) {
      setError('Autenticación no configurada en este entorno')
      return
    }
    setLoading(true)
    let ok = false
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const user = credential.user
      ok = true
      setSessionCookie(user.uid)
      cacheProfile(user.uid, profileFromFirebaseUser(user, email.trim()))
      router.replace('/ver')

      user.getIdToken()
        .then(idToken => syncAuthLogin(idToken))
        .then(profile => { if (profile) cacheProfile(user.uid, profile) })
        .catch(() => {})

      fetchPublishedCourse()
        .then(course => { if (course) prefetchPurchase(course.id, user) })
        .catch(() => {})
    } catch (err: unknown) {
      document.cookie = '__tauren_session=; path=/; max-age=0; SameSite=Lax'
      const code = (err as { code?: string })?.code ?? ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos')
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde')
      } else if (code.startsWith('auth/')) {
        setError('Error de autenticación. Intenta de nuevo')
      } else {
        setError((err as Error)?.message || 'Error al iniciar sesión')
      }
    } finally {
      if (!ok) setLoading(false)
    }
  }

  if (authLoading || firebaseUser) return null

  return (
    <div className="relative min-h-[100dvh] min-h-screen w-full flex items-start justify-center px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top,0px)+3.5rem))] pb-8 sm:px-6">
      <PageBackground scene="login" />
      <Link
        href="/"
        className="fixed top-[max(1rem,env(safe-area-inset-top,0px)+0.75rem)] left-[max(1rem,env(safe-area-inset-left,0px)+0.75rem)] z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/80 hover:text-white border border-white/15 bg-[rgba(8,18,32,0.75)] hover:bg-[rgba(8,18,32,0.9)] backdrop-blur-md transition-colors"
      >
        <Home size={14} style={{ color: 'var(--scai-teal)' }} />
        Inicio
      </Link>

      <div className="relative z-10 w-full max-w-[17.5rem] sm:max-w-[18rem]">
        <div
          className="rounded-xl border border-white/12 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
          style={{ background: 'rgba(8,18,32,0.92)', backdropFilter: 'blur(16px)' }}
        >
          <div className="px-4 pt-4 pb-1 text-center">
            <Link href="/" className="inline-flex justify-center mb-2">
              <Image src={ScaiLogo} alt="SCAI" priority className="h-6 w-auto" />
            </Link>
            <h1 className="text-base font-bold text-white tracking-tight">Inicio de sesión</h1>
            <p className="text-white/50 text-[10px] mt-1 leading-snug px-1">
              III Jornadas de Inmunología Clínica
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2.5">
            {error && (
              <div className="bg-red-500/12 border border-red-500/25 rounded-lg px-2.5 py-2 text-red-300 text-[11px] leading-snug">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white/60 text-[11px] font-medium mb-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="doctor@hospital.com"
                className="w-full rounded-lg px-3 py-2 text-white placeholder:text-white/25 focus:outline-none border border-white/12 focus:border-[rgba(18,180,198,0.55)] bg-[rgba(4,12,22,0.9)] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-white/60 text-[11px] font-medium mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3 py-2 pr-9 text-white placeholder:text-white/25 focus:outline-none border border-white/12 focus:border-[rgba(18,180,198,0.55)] bg-[rgba(4,12,22,0.9)] transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors p-0.5"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] text-sm disabled:opacity-50"
              style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 14px rgba(18,180,198,0.28)' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="px-4 py-2.5 border-t border-white/8 text-center">
            <p className="text-white/45 text-[10px]">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="text-[color:var(--scai-teal)] font-medium hover:brightness-125">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
