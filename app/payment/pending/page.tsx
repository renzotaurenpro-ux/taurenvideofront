'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight } from 'lucide-react'
import ScaiLogo from '../../../Logotipo-SCAI.png'
import { useRequireAuth } from '@/lib/useRequireAuth'

function PendingContent() {
  const { ready } = useRequireAuth()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id')

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1928' }}>
        <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--scai-teal)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 60%, #0B2240 100%)' }}>
      <div className="w-full max-w-md text-center">
        <Link href="/ver" className="inline-flex justify-center mb-6">
          <Image src={ScaiLogo} alt="SCAI" priority className="h-9 w-auto" />
        </Link>

        <div className="rounded-2xl border p-8 space-y-5"
          style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(234,179,8,0.25)' }}>
          <div className="flex items-center justify-center text-yellow-400">
            <Clock size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Pago pendiente</h1>
            <p className="text-white/50 text-sm mt-2 leading-relaxed">
              Tu pago está siendo revisado. Recibirás acceso automáticamente en cuanto sea aprobado.
              Los pagos en efectivo pueden tardar hasta 2 días hábiles.
            </p>
            {paymentId && (
              <p className="text-white/25 text-xs mt-2">ID: {paymentId}</p>
            )}
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
      </div>
    </div>
  )
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1928' }} />
    }>
      <PendingContent />
    </Suspense>
  )
}
