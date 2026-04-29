'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Microscope, Eye, EyeOff, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { clearCart } from '@/lib/cart'

function PagoExitosoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const stripeSessionId = searchParams.get('session_id')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validPayment, setValidPayment] = useState<boolean | null>(null)

  useEffect(() => {
    if (!stripeSessionId) {
      router.push('/pagar')
      return
    }
    setTimeout(() => {
      setValidPayment(true)
      setEmail(localStorage.getItem('tauren-user-email') || '')
    }, 300)
  }, [stripeSessionId, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (!email) {
      setError('Ingresa un correo válido')
      return
    }
    setLoading(true)
    localStorage.setItem('tauren-user-email', email)
    localStorage.setItem('tauren-user-paid', 'true')
    clearCart()
    setTimeout(() => {
      setLoading(false)
      router.push('/ver')
    }, 350)
  }

  if (validPayment === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1928' }}>
        <p className="text-white/30">Verificando pago...</p>
      </div>
    )
  }

  if (validPayment === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0B1928' }}>
        <div className="text-center">
          <p className="text-white/60 mb-4">No se encontró un pago válido.</p>
          <Link href="/pagar" style={{ color: 'var(--scai-teal)' }} className="hover:brightness-125">
            Volver al pago
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 60%, #0B2240 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <Image src={ScaiLogo} alt="SCAI" priority className="h-9 w-auto" />
          </Link>
          <div className="flex items-center justify-center gap-2 text-green-400 mb-3">
            <CheckCircle size={22} />
            <span className="font-semibold text-base">¡Pago exitoso!</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Crea tu cuenta</h1>
          <p className="text-white/30 text-sm mt-2 max-w-xs mx-auto">
            Configura tus credenciales para acceder a las III Jornadas de Inmunología Clínica
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-5 sm:p-8 space-y-5 border"
          style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}
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
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/20 focus:outline-none transition-colors text-base"
                style={{ background: 'rgba(11,25,40,0.8)', border: '1px solid rgba(18,180,198,0.2)' }}
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

          <div>
            <label className="block text-white/50 text-sm mb-2">Confirmar contraseña</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repite tu contraseña"
              className="w-full rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors text-base"
              style={{ background: 'rgba(11,25,40,0.8)', border: '1px solid rgba(18,180,198,0.2)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-base disabled:opacity-50"
            style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 16px rgba(18,180,198,0.3)' }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta y acceder'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function PagoExitosoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1928' }}>
          <p className="text-white/30">Cargando...</p>
        </div>
      }
    >
      <PagoExitosoContent />
    </Suspense>
  )
}
