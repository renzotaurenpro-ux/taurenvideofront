'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Home } from 'lucide-react'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth, cacheProfileToStorage } from '@/lib/authContext'
import PageBackground from '@/components/PageBackground'

const API_BASE = '/api/proxy'

export default function LoginPage() {
  const router = useRouter()
  const { setProfile } = useAuth()
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
    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()

      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `__tauren_session=${credential.user.uid}; path=/; max-age=86400; SameSite=Lax${secure}`

      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (!data) return
          const p = data.user ?? data
          setProfile(p)
          cacheProfileToStorage(credential.user.uid, p)
        })
        .catch(() => {})

      router.push('/ver')
    } catch (err: any) {
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
    <div className="relative min-h-[100dvh] min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden overflow-y-auto px-4 sm:px-6 md:px-8 pt-[max(4.5rem,calc(env(safe-area-inset-top,0px)+3.5rem))] sm:pt-[max(5rem,calc(env(safe-area-inset-top,0px)+4rem))] pb-12 sm:pb-16">
      <PageBackground scene="login" />
      <Link
        href="/"
        className="fixed top-[max(1rem,env(safe-area-inset-top,0px)+0.75rem)] left-[max(1rem,env(safe-area-inset-left,0px)+0.75rem)] z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-white/65 hover:text-white/90 border border-white/12 bg-black/20 hover:bg-black/35 backdrop-blur-sm transition-colors"
      >
        <Home size={12} style={{ color: 'var(--scai-teal)' }} />
        Inicio
      </Link>
      <div className="w-full max-w-[min(100%,26rem)] mx-auto relative z-10 shrink-0">
        <div className="flex flex-col items-center mb-5 sm:mb-7">
          <Link href="/" className="flex items-center mb-4 sm:mb-5">
            <Image src={ScaiLogo} alt="SCAI" priority className="h-9 sm:h-10 w-auto" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center">Inicio de sesión</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1.5 text-center max-w-[18rem] sm:max-w-xs px-1">
            Accede a las III Jornadas de Inmunología Clínica
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-5 sm:p-7 md:p-8 space-y-4 sm:space-y-5 border w-full"
          style={{ background: 'rgba(14,32,53,0.78)', borderColor: 'rgba(18,180,198,0.18)', backdropFilter: 'blur(14px)' }}
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/50 text-sm mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="doctor@hospital.com"
              className="w-full rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors text-base"
              style={{ background: 'rgba(11,25,40,0.8)', border: '1px solid rgba(18,180,198,0.2)' }}
              onFocus={e => e.target.style.borderColor = 'var(--scai-teal)'}
              onBlur={e => e.target.style.borderColor = 'rgba(18,180,198,0.2)'}
            />
          </div>

          <div>
            <label className="block text-white/50 text-sm mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/20 focus:outline-none transition-colors text-base"
                style={{ background: 'rgba(11,25,40,0.8)', border: '1px solid rgba(18,180,198,0.2)' }}
                onFocus={e => e.target.style.borderColor = 'var(--scai-teal)'}
                onBlur={e => e.target.style.borderColor = 'rgba(18,180,198,0.2)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-base disabled:opacity-50"
            style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 16px rgba(18,180,198,0.3)' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-white/25 text-xs sm:text-sm mt-4 sm:mt-5 px-1">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" style={{ color: 'var(--scai-teal)' }} className="hover:brightness-125">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
