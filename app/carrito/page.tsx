'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Shield, ShoppingCart, Award, Users, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { useAuth } from '@/lib/authContext'
import { fetchAuth } from '@/lib/api'
import { fetchPublishedCourse, checkCoursePurchase, type Course } from '@/lib/courses'
import { coursePrice, formatCLP } from '@/lib/pricing'

const IS_SANDBOX = process.env.NEXT_PUBLIC_MP_MODE !== 'production'

export default function CarritoPage() {
  const router = useRouter()
  const { firebaseUser, loading: authLoading } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const price = coursePrice(course?.priceClp)

  useEffect(() => {
    if (authLoading) return
    if (!firebaseUser) { router.push('/login'); return }

    ;(async () => {
      try {
        const c = await fetchPublishedCourse()
        if (!c) { setCourse(null); setLoading(false); return }

        const purchased = await checkCoursePurchase(c.id)
        if (purchased) {
          router.replace('/ver')
          return
        }

        setCourse(c)
      } catch {
        setCourse(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [authLoading, firebaseUser, router])

  async function handleCheckout() {
    if (!course?.id) {
      setCheckoutError('No hay curso disponible.')
      return
    }
    setCheckoutError('')
    setCheckoutLoading(true)
    try {
      const res = await fetchAuth('/payment/checkout', {
        method: 'POST',
        body: JSON.stringify({ courseId: course.id }),
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

  const isEmpty = !course && !loading

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
          <div className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-sm font-semibold"
            style={{ borderColor: 'rgba(18,180,198,0.4)', background: 'rgba(18,180,198,0.1)', color: 'var(--scai-teal)' }}>
            <ShoppingCart size={13} />
            1
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 sm:gap-8 px-4 sm:px-6 py-8 sm:py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-8">
          <h1 className="mb-5 flex items-center gap-2.5 text-lg font-bold">
            <ShoppingCart size={18} style={{ color: 'var(--scai-teal)' }} />
            Tu curso
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-14 gap-3 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--scai-teal)' }} />
              <span className="text-sm">Cargando curso...</span>
            </div>
          ) : isEmpty ? (
            <div className="rounded-2xl border p-8 sm:p-10 text-center"
              style={{ borderColor: 'rgba(18,180,198,0.18)', background: 'rgba(18,180,198,0.06)' }}>
              <p className="text-base sm:text-lg font-bold">Sin cursos disponibles</p>
              <p className="text-sm text-muted-foreground mt-2">Vuelve pronto para ver el contenido disponible.</p>
              <Link href="/ver" className="mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold border"
                style={{ borderColor: 'rgba(18,180,198,0.2)' }}>
                Volver al video
              </Link>
            </div>
          ) : (
            <div className="rounded-xl sm:rounded-2xl border p-4 sm:p-5"
              style={{ borderColor: 'rgba(18,180,198,0.35)', background: 'rgba(18,180,198,0.08)' }}>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl border"
                  style={{ background: 'rgba(18,180,198,0.12)', borderColor: 'rgba(18,180,198,0.3)' }}>
                  <Image src={ScaiLogo} alt="SCAI" className="h-8 w-auto" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--scai-teal)' }}>
                    Sociedad Chilena de Alergia e Inmunología
                  </p>
                  <h2 className="font-bold text-sm sm:text-base leading-snug mb-1.5">{course!.title}</h2>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Users size={11} style={{ color: 'var(--scai-teal)' }} />15 expositores</div>
                    <div className="flex items-center gap-1"><Award size={11} style={{ color: 'var(--scai-teal)' }} />CONACEM</div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xl sm:text-2xl font-black">{formatCLP(price)}</p>
                </div>
              </div>
            </div>
          )}

          <ul className="mt-6 space-y-2">
            {[
              'Acceso completo a la grabación HD',
              'Todos los episodios del curso',
              'Cuenta personal intransferible',
              'Acreditación CONACEM',
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
            <div className="border-t border-border pt-3 flex justify-between font-bold text-sm sm:text-base">
              <span>Total a pagar</span>
              <span style={{ color: 'var(--scai-teal)' }}>{isEmpty ? '$0' : formatCLP(price)}</span>
            </div>
          </div>

          {checkoutError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {checkoutError}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkoutLoading || isEmpty || loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl py-4 text-sm sm:text-base font-bold text-white active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.3)' }}
          >
            {checkoutLoading
              ? <><Loader2 size={17} className="animate-spin" /> Redirigiendo a Mercado Pago...</>
              : <><CreditCard size={17} /> Pagar {isEmpty ? '' : formatCLP(price)}</>
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
            <p className="text-xs text-muted-foreground pt-1">
              Contenido disponible hasta el 31 de octubre de 2026
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}
