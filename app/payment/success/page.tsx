'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import ScaiLogo from '../../../Logotipo-SCAI.png'
import { clearCart } from '@/lib/cart'
import { fetchAuth } from '@/lib/api'
import { fetchPublishedVideos } from '@/lib/videos'
import { useRequireAuth } from '@/lib/useRequireAuth'

function SuccessContent() {
  const { firebaseUser, ready } = useRequireAuth()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')

  const [checking, setChecking] = useState(true)
  const [purchased, setPurchased] = useState(false)

  useEffect(() => {
    if (!ready) return

    clearCart()

    async function verify() {
      if (!firebaseUser) { setChecking(false); return }
      try {
        const videos = await fetchPublishedVideos()
        const video = videos[0]
        if (!video) { setChecking(false); return }

        for (let i = 0; i < 5; i++) {
          const res = await fetchAuth(`/purchases/check/${video.id}`)
          if (res.ok) {
            const data = await res.json()
            if (data.purchased === true || data.hasPurchase === true) {
              setPurchased(true)
              break
            }
          }
          if (i < 4) await new Promise(r => setTimeout(r, 2000))
        }
      } catch {
        setPurchased(false)
      }
      setChecking(false)
    }

    verify()
  }, [ready, firebaseUser, paymentId, status])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 60%, #0B2240 100%)' }}>
      <div className="w-full max-w-md text-center">
        <Link href="/ver" className="inline-flex justify-center mb-6">
          <Image src={ScaiLogo} alt="SCAI" priority className="h-9 w-auto" />
        </Link>

        {checking ? (
          <div className="rounded-2xl border p-8 space-y-4"
            style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}>
            <Loader2 size={40} className="animate-spin mx-auto" style={{ color: 'var(--scai-teal)' }} />
            <p className="text-white font-semibold text-lg">Verificando tu pago...</p>
            <p className="text-white/40 text-sm">Esto puede tomar unos segundos</p>
          </div>
        ) : purchased ? (
          <div className="rounded-2xl border p-8 space-y-5"
            style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}>
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">¡Pago aprobado!</h1>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">
                Ya tienes acceso completo a las III Jornadas Regionales de Inmunología Clínica.
              </p>
            </div>
            <Link
              href="/ver"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white"
              style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.3)' }}
            >
              Ver grabación
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border p-8 space-y-5"
            style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}>
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <CheckCircle size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Pago en proceso</h1>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">
                Tu pago está siendo procesado. En cuanto sea aprobado tendrás acceso automáticamente.
                {paymentId && <span className="block mt-1 text-white/30 text-xs">ID: {paymentId}</span>}
              </p>
            </div>
            <Link
              href="/ver"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white"
              style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.3)' }}
            >
              Ir al video
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1928' }}>
        <Loader2 size={32} className="animate-spin text-white/30" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
