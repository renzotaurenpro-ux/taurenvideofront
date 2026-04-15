'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Microscope, Check, Shield, Clock, ArrowLeft } from 'lucide-react'

export default function PagarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const precio = process.env.NEXT_PUBLIC_EVENTO_PRECIO || '99'

  function handlePago() {
    setLoading(true)
    setError('')
    if (!precio) {
      setError('No se pudo iniciar el pago. Intenta de nuevo.')
      setLoading(false)
      return
    }
    setTimeout(() => {
      router.push('/pago-exitoso?session_id=demo-session-frontend')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 text-white/40 hover:text-white/70 text-sm">
            <ArrowLeft size={14} />
            Volver
          </Link>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
              <Microscope size={15} className="text-white" />
            </div>
            <div className="text-left">
              <span className="text-white font-bold text-sm block leading-none">SCAI</span>
              <span className="text-white/40 text-xs leading-none">Inmunología Clínica</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-900/40 to-cyan-800/10 px-8 py-6 border-b border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-400/60 rounded-full" />
              <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                Sociedad Chilena de Alergia e Inmunología
              </span>
            </div>
            <h1 className="text-xl font-bold text-white leading-snug">
              III Jornadas Regionales de Inmunología Clínica
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
                {error}
              </div>
            )}

            <ul className="space-y-3 mb-8">
              {[
                'Acceso completo a la grabación HD 1080p',
                '15 ponencias de especialistas',
                'Acreditación oficial CONACEM',
                'Soporte técnico',
                'Cuenta personal e intransferible',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-5 h-5 bg-cyan-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-cyan-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="bg-[#1c1c1c] rounded-xl px-6 py-4 flex items-center justify-between mb-6">
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Pago único</div>
                <div className="text-white/60 text-sm">Sin suscripciones ni cargos adicionales</div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-white">${precio}</span>
                <span className="text-white/30 text-sm ml-1">USD</span>
              </div>
            </div>

            <button
              onClick={handlePago}
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-cyan-600/20"
            >
              {loading ? 'Procesando pago...' : 'Pagar con tarjeta'}
            </button>

            <div className="flex items-center justify-center gap-6 mt-5 text-white/20 text-xs">
              <div className="flex items-center gap-1.5">
                <Shield size={12} />
                Pago seguro con Stripe
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} />
                Acceso inmediato
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs mt-6 px-4">
          Al realizar el pago aceptas los términos de servicio. La cuenta es personal e
          intransferible. Prohibida la grabación y distribución del contenido.
        </p>
        <p className="text-center text-white/25 text-sm mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
