'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Shield, ShoppingCart, CalendarDays, Award, Users, Clock, CheckCircle2, Loader2, Video } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { useAuth } from '@/lib/authContext'
import { fetchAuth } from '@/lib/api'
import { fetchPublishedVideos, type BackendVideo } from '@/lib/videos'

const PRECIO_NETO = 25000
const PRECIO_IVA = Math.round(PRECIO_NETO * 0.19)
const PRECIO_TOTAL = PRECIO_NETO + PRECIO_IVA
const IS_SANDBOX = process.env.NODE_ENV !== 'production'

function formatCLP(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

export default function CarritoPage() {
  const router = useRouter()
  const { firebaseUser, loading: authLoading } = useAuth()
  const [videos, setVideos] = useState<BackendVideo[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!firebaseUser) { router.push('/login'); return }

    fetchPublishedVideos().then(v => {
      setVideos(v)
      if (v.length > 0) setSelectedId(v[0].id)
      setVideosLoading(false)
    })
  }, [authLoading, firebaseUser, router])

  async function handleCheckout() {
    if (!selectedId) {
      setCheckoutError('Selecciona un video para continuar.')
      return
    }
    setCheckoutError('')
    setCheckoutLoading(true)
    try {
      const res = await fetchAuth('/payment/checkout', {
        method: 'POST',
        body: JSON.stringify({ videoId: selectedId }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || 'Error al crear el pago')
      const url = IS_SANDBOX ? data.sandboxInitPoint : data.initPoint
      if (!url) throw new Error('No se recibió URL de pago')
      window.location.href = url
    } catch (err: any) {
      setCheckoutError(err?.message || 'Error al procesar el pago')
      setCheckoutLoading(false)
    }
  }

  const isEmpty = videos.length === 0 && !videosLoading

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/ver" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Volver al video</span>
            <span className="sm:hidden">Volver</span>
          </Link>
          <Image src={ScaiLogo} alt="SCAI" priority className="h-7 w-auto" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-sm font-semibold"
              style={{ borderColor: 'rgba(18,180,198,0.4)', background: 'rgba(18,180,198,0.1)', color: 'var(--scai-teal)' }}>
              <ShoppingCart size={13} />
              {videosLoading ? '…' : videos.length}
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 sm:gap-8 px-4 sm:px-6 py-8 sm:py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-8">
          <h1 className="mb-5 flex items-center gap-2.5 text-lg font-bold">
            <ShoppingCart size={18} style={{ color: 'var(--scai-teal)' }} />
            Acceso disponible
          </h1>

          {videosLoading ? (
            <div className="flex items-center justify-center py-14 gap-3 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--scai-teal)' }} />
              <span className="text-sm">Cargando videos disponibles...</span>
            </div>
          ) : isEmpty ? (
            <div className="rounded-2xl border p-8 sm:p-10 text-center"
              style={{ borderColor: 'rgba(18,180,198,0.18)', background: 'rgba(18,180,198,0.06)' }}>
              <div className="mx-auto mb-3 h-11 w-11 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(18,180,198,0.18)' }}>
                <Video size={18} style={{ color: 'var(--scai-teal)' }} />
              </div>
              <p className="text-base sm:text-lg font-bold">Sin videos disponibles</p>
              <p className="text-sm text-muted-foreground mt-2">Vuelve pronto para ver el contenido disponible.</p>
              <Link href="/ver" className="mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold border"
                style={{ borderColor: 'rgba(18,180,198,0.2)' }}>
                Volver al video
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map(video => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setSelectedId(video.id)}
                  className="w-full text-left rounded-xl sm:rounded-2xl border p-4 sm:p-5 transition-all"
                  style={{
                    borderColor: selectedId === video.id ? 'var(--scai-teal)' : 'rgba(18,180,198,0.25)',
                    background: selectedId === video.id ? 'rgba(18,180,198,0.1)' : 'rgba(18,180,198,0.04)',
                    outline: selectedId === video.id ? '2px solid rgba(18,180,198,0.3)' : 'none',
                  }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl border"
                      style={{ background: 'rgba(18,180,198,0.12)', borderColor: 'rgba(18,180,198,0.3)' }}>
                      <Image src={ScaiLogo} alt="SCAI" className="h-8 w-auto" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--scai-teal)' }}>
                        Sociedad Chilena de Alergia e Inmunología
                      </p>
                      <h2 className="font-bold text-sm sm:text-base leading-snug mb-1.5">
                        {video.title}
                      </h2>
                      {video.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarDays size={11} style={{ color: 'var(--scai-teal)' }} />
                          19 Junio 2026
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={11} style={{ color: 'var(--scai-teal)' }} />
                          16 expositores
                        </div>
                        <div className="flex items-center gap-1">
                          <Award size={11} style={{ color: 'var(--scai-teal)' }} />
                          CONACEM
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={11} style={{ color: 'var(--scai-teal)' }} />
                          Acceso inmediato
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
                      <p className="text-xl sm:text-2xl font-black">{formatCLP(PRECIO_NETO)}</p>
                      <p className="text-xs text-muted-foreground">+ IVA</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <ul className="mt-6 space-y-2">
            {[
              'Acceso completo a la grabación HD',
              'Sin límite de tiempo para ver la grabación',
              'Cuenta personal intransferible',
              'Acreditación CONACEM',
              'Soporte técnico incluido',
            ].map(feat => (
              <li key={feat} className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: 'var(--scai-teal)' }} />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-5 font-bold text-base sm:text-lg">Resumen del pedido</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
              <span>Subtotal</span>
              <span className="flex-shrink-0 ml-2">{isEmpty ? '$0' : formatCLP(PRECIO_NETO)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
              <span>IVA (19%)</span>
              <span className="flex-shrink-0 ml-2">{isEmpty ? '$0' : formatCLP(PRECIO_IVA)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-sm sm:text-base">
              <span>Total</span>
              <span style={{ color: 'var(--scai-teal)' }}>{isEmpty ? '$0' : formatCLP(PRECIO_TOTAL)}</span>
            </div>
          </div>

          {checkoutError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {checkoutError}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || isEmpty || videosLoading || !selectedId}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl py-4 text-sm sm:text-base font-bold text-white active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.3)' }}
          >
            {checkoutLoading
              ? <><Loader2 size={17} className="animate-spin" /> Redirigiendo a Mercado Pago...</>
              : <><CreditCard size={17} /> Pagar con Mercado Pago</>
            }
          </button>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={12} className="flex-shrink-0" style={{ color: 'var(--scai-teal)' }} />
              Pago seguro con Mercado Pago
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={12} className="flex-shrink-0" style={{ color: 'var(--scai-teal)' }} />
              Acceso inmediato tras el pago
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
