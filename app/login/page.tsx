'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Home } from 'lucide-react'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, hasFirebaseConfig } from '@/lib/firebase'
import { useAuth } from '@/lib/authContext'
import { setSessionCookie, syncAuthLogin, fetchAuthProfile, waitForFirebaseUser } from '@/lib/auth'
import type { UserProfile } from '@/lib/authContext'
import { setCachedPurchase } from '@/lib/api'
import { fetchPublishedCourse, checkCoursePurchase } from '@/lib/courses'
import PageBackground from '@/components/PageBackground'

export default function LoginPage() {
  const router = useRouter()
  const { cacheProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const uid = credential.user.uid
      setSessionCookie(uid)
      await waitForFirebaseUser()
      const idToken = await credential.user.getIdToken()
      let profile: UserProfile | null = await syncAuthLogin(idToken)
      if (!profile) profile = await fetchAuthProfile()
      if (!profile) {
        profile = {
          id: uid,
          email: credential.user.email ?? email.trim(),
          firstName: credential.user.displayName?.split(' ')[0] ?? '',
          lastName: credential.user.displayName?.split(' ').slice(1).join(' ') ?? '',
          role: 'USER',
          firebaseUid: uid,
        }
      }
      cacheProfile(uid, profile)
      const course = await fetchPublishedCourse()
      if (course) {
        const purchased = await checkCoursePurchase(course.id)
        setCachedPurchase(course.id, purchased)
      }
      router.replace('/ver')
    } catch (err: any) {
      document.cookie = '__tauren_session=; path=/; max-age=0; SameSite=Lax'
      const code = err?.code ?? ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos')
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde')
      } else if (code.startsWith('auth/')) {
        setError('Error de autenticación. Intenta de nuevo')
      } else {
        setError(err?.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-4 sm:px-6 pt-[max(2.75rem,calc(env(safe-area-inset-top,0px)+2.25rem))] pb-8">
      <PageBackground scene="login" />
      <Link
        href="/"
        className="fixed top-[max(1rem,env(safe-area-inset-top,0px)+0.75rem)] left-[max(1rem,env(safe-area-inset-left,0px)+0.75rem)] z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-white/65 hover:text-white/90 border border-white/12 bg-black/20 hover:bg-black/35 backdrop-blur-sm transition-colors"
      >
        <Home size={12} style={{ color: 'var(--scai-teal)' }} />
        Inicio
      </Link>
      <div className="w-full max-w-[min(100%,18.5rem)] mx-auto relative z-10 shrink-0">
        <div className="flex flex-col items-center mb-2.5">
          <Link href="/" className="flex items-center mb-2.5">
            <Image src={ScaiLogo} alt="SCAI" priority className="h-7 w-auto" />
          </Link>
          <h1 className="text-lg font-bold text-white text-center">Inicio de sesión</h1>
          <p className="text-white/45 text-[11px] mt-1 text-center max-w-[15rem] leading-snug">
            Accede a las III Jornadas de Inmunología Clínica
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-3.5 space-y-3 border border-white/10 w-full"
          style={{ background: 'rgba(14,32,53,0.52)', backdropFilter: 'blur(14px)' }}
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/50 text-xs mb-1.5">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="doctor@hospital.com"
              className="w-full rounded-lg px-3 py-2.5 text-white placeholder:text-white/20 focus:outline-none border border-white/10 focus:border-white/20 bg-[rgba(11,25,40,0.8)] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg px-3 py-2.5 pr-10 text-white placeholder:text-white/20 focus:outline-none border border-white/10 focus:border-white/20 bg-[rgba(11,25,40,0.8)] transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-0.5"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
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

        <p className="text-center text-white/30 text-[11px] mt-2.5 px-1">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" style={{ color: 'var(--scai-teal)' }} className="hover:brightness-125">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
