'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Microscope, Check, Shield, Clock, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { getCart } from '@/lib/cart'

const PRECIO_NETO = 25000
const PRECIO_IVA = Math.round(PRECIO_NETO * 0.19)
const PRECIO_TOTAL = PRECIO_NETO + PRECIO_IVA

function formatCLP(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

export default function PagarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (getCart().length === 0) router.push('/carrito')
  }, [router])

  function handlePago() {
    setLoading(true)
    setError('')
    setTimeout(() => { router.push('/pago-exitoso?session_id=demo-session-frontend') }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 60%, #0B2240 100%)' }}>
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <Link href="/carrito" className="self-start inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-4 sm:mb-6">
            <ArrowLeft size={14} />
            Volver al carrito
          </Link>
          <div className="flex items-center gap-2.5">
            <Image src={ScaiLogo} alt="SCAI" priority className="h-9 w-auto" />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border" style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}>
          <div className="px-5 sm:px-8 py-5 border-b" style={{ background: 'linear-gradient(90deg, rgba(18,180,198,0.2) 0%, rgba(18,180,198,0.05) 100%)', borderColor: 'rgba(18,180,198,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--scai-teal)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--scai-teal)' }}>
                Sociedad Chilena de Alergia e Inmunología
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
              III Jornadas Regionales de Inmunología Clínica
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mt-1 leading-relaxed">
              Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad
            </p>
          </div>

          <div className="p-5 sm:p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">{error}</div>
            )}

            <ul className="space-y-2.5 mb-6">
              {[
                'Acceso completo a la grabación HD 1080p',
                '16 ponencias de especialistas',
                'Acreditación oficial CONACEM',
                'Soporte técnico',
                'Cuenta personal e intransferible',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-white/60 text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(18,180,198,0.15)' }}>
                    <Check size={11} style={{ color: 'var(--scai-teal)' }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="rounded-xl px-4 sm:px-6 py-4 flex items-center justify-between mb-5"
              style={{ background: 'rgba(11,25,40,0.8)', border: '1px solid rgba(18,180,198,0.1)' }}>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Pago único</div>
                <div className="text-white/50 text-xs sm:text-sm">Sin suscripciones ni cargos adicionales</div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <div className="flex flex-col items-end">
                  <span className="text-3xl sm:text-4xl font-black text-white">{formatCLP(PRECIO_NETO)}</span>
                  <span className="text-white/30 text-xs sm:text-sm">+ IVA</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-white/30 flex items-center justify-between mb-6 px-1">
              <span>IVA (19%)</span>
              <span className="tabular-nums">{formatCLP(PRECIO_IVA)}</span>
            </div>

            <div className="rounded-xl px-4 sm:px-6 py-4 flex items-center justify-between mb-5"
              style={{ background: 'rgba(18,180,198,0.08)', border: '1px solid rgba(18,180,198,0.2)' }}>
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Total</div>
                <div className="text-white/50 text-xs sm:text-sm">Pago único</div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <span className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--scai-teal)' }}>
                  {formatCLP(PRECIO_TOTAL)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePago}
              disabled={loading}
              className="w-full text-white font-bold text-base sm:text-lg py-4 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.35)' }}
            >
              {loading ? 'Procesando pago...' : 'Pagar con tarjeta'}
            </button>

            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 text-white/20 text-xs">
              <div className="flex items-center gap-1.5"><Shield size={11} /> Pago seguro con Stripe</div>
              <div className="flex items-center gap-1.5"><Clock size={11} /> Acceso inmediato</div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs mt-5 px-4 leading-relaxed">
          Al realizar el pago aceptas los términos de servicio. La cuenta es personal e intransferible.
        </p>
        <p className="text-center text-white/25 text-sm mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--scai-teal)' }} className="hover:brightness-125">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
