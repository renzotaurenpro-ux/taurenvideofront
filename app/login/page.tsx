'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Microscope, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    localStorage.setItem('tauren-user-email', email)
    localStorage.setItem('tauren-user-paid', 'true')
    setTimeout(() => {
      setLoading(false)
      router.push('/ver')
    }, 350)
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-cyan-600 rounded-xl flex items-center justify-center">
              <Microscope size={17} className="text-white" />
            </div>
            <div className="text-left">
              <span className="text-white font-bold text-base block leading-none">SCAI</span>
              <span className="text-white/40 text-xs leading-none">Sociedad Chilena de Alergia e Inmunología</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white">Iniciar sesión</h1>
          <p className="text-white/30 text-sm mt-2">
            Accede a las III Jornadas de Inmunología Clínica
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111] border border-white/5 rounded-2xl p-8 space-y-5"
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
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500 transition-colors"
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
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-white/25 text-sm mt-6">
          ¿No tienes acceso?{' '}
          <Link href="/carrito" className="text-cyan-400 hover:text-cyan-300">
            Obtén acceso aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
