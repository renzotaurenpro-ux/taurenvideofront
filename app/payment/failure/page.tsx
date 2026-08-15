'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import ScaiLogo from '../../../Logotipo-SCAI.png'
import SupportContact from '@/components/SupportContact'
import { useRequireAuth } from '@/lib/useRequireAuth'

function FailureContent() {
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
          style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(239,68,68,0.25)' }}>
          <div className="flex items-center justify-center text-red-400">
            <XCircle size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Pago rechazado</h1>
            <p className="text-white/50 text-sm mt-2 leading-relaxed">
              No pudimos procesar tu pago. Puedes intentarlo nuevamente con otro medio de pago.
            </p>
            {paymentId && (
              <p className="text-white/25 text-xs mt-2">ID: {paymentId}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/carrito"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white"
              style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.3)' }}
            >
              <RefreshCw size={16} />
              Intentar nuevamente
            </Link>
            <Link
              href="/ver"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold border text-white/60 hover:text-white"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <ArrowLeft size={15} />
              Volver al video
            </Link>
          </div>
          <SupportContact variant="compact" className="pt-2 border-t border-white/10 justify-center items-center" />
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1928' }} />
    }>
      <FailureContent />
    </Suspense>
  )
}
