'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Shield, ShoppingCart, CalendarDays, Award, Users, Clock, CheckCircle2, Trash2 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { cartCount, getCart, removeFromCart, type CartItem } from '@/lib/cart'
import { useAuth } from '@/lib/authContext'

const PRECIO_NETO = 25000
const PRECIO_IVA = Math.round(PRECIO_NETO * 0.19)
const PRECIO_TOTAL = PRECIO_NETO + PRECIO_IVA

function formatCLP(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

export default function CarritoPage() {
  const router = useRouter()
  const { firebaseUser, loading: authLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!firebaseUser) { router.push('/login'); return }
    const sync = () => setItems(getCart())
    sync()
    window.addEventListener('tauren-cart-updated', sync)
    return () => window.removeEventListener('tauren-cart-updated', sync)
  }, [authLoading, firebaseUser, router])

  const count = useMemo(() => cartCount(items), [items])
  const subtotal = useMemo(() => items.reduce((acc, x) => acc + x.priceNeto * x.quantity, 0), [items])
  const iva = useMemo(() => Math.round(subtotal * 0.19), [subtotal])
  const total = useMemo(() => subtotal + iva, [subtotal, iva])
  const empty = items.length === 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={15} />
            <span className="hidden sm:inline">Volver al inicio</span>
            <span className="sm:hidden">Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <Image src={ScaiLogo} alt="SCAI" priority className="h-7 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-sm font-semibold"
              style={{ borderColor: 'rgba(18,180,198,0.4)', background: 'rgba(18,180,198,0.1)', color: 'var(--scai-teal)' }}>
              <ShoppingCart size={13} />
              {count}
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 sm:gap-8 px-4 sm:px-6 py-8 sm:py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-8">
          <h1 className="mb-5 flex items-center gap-2.5 text-lg font-bold">
            <ShoppingCart size={18} style={{ color: 'var(--scai-teal)' }} />
            Tu carrito
          </h1>

          {empty ? (
            <div className="rounded-2xl border p-8 sm:p-10 text-center"
              style={{ borderColor: 'rgba(18,180,198,0.18)', background: 'rgba(18,180,198,0.06)' }}>
              <div className="mx-auto mb-3 h-11 w-11 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(18,180,198,0.18)' }}>
                <ShoppingCart size={18} style={{ color: 'var(--scai-teal)' }} />
              </div>
              <p className="text-base sm:text-lg font-bold">Tu carrito está vacío</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Agrega el acceso a la grabación para continuar con el pago.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  href="/ver"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white"
                  style={{ background: 'var(--scai-teal)' }}
                >
                  Ir al video
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold border"
                  style={{ borderColor: 'rgba(18,180,198,0.2)' }}
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="rounded-xl sm:rounded-2xl border p-4 sm:p-5"
                  style={{ borderColor: 'rgba(18,180,198,0.25)', background: 'rgba(18,180,198,0.06)' }}>
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
                        {item.title}
                      </h2>
                      {item.subtitle && (
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 leading-relaxed">
                          {item.subtitle}
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
                    <div className="flex-shrink-0 text-right flex flex-col items-end gap-2">
                      <div>
                        <p className="text-xl sm:text-2xl font-black">{formatCLP(item.priceNeto)}</p>
                        <p className="text-xs text-muted-foreground">+ IVA</p>
                      </div>
                      <button
                        className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 border"
                        style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={13} />
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <ul className="mt-5 space-y-2">
            {[
              'Acceso completo a la grabación HD',
              'Sin límite de tiempo para ver la grabación',
              'Cuenta personal intransferible',
              'Acreditación CONACEM',
              'Soporte técnico incluido',
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2 size={14} className="flex-shrink-0" style={{ color: 'var(--scai-teal)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-5 font-bold text-base sm:text-lg">Resumen del pedido</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
              <span>Subtotal</span>
              <span className="flex-shrink-0 ml-2">{formatCLP(subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
              <span>IVA (19%)</span>
              <span className="flex-shrink-0 ml-2">{formatCLP(iva || 0)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-sm sm:text-base">
              <span>Total</span>
              <span style={{ color: 'var(--scai-teal)' }}>{formatCLP(total || 0)}</span>
            </div>
          </div>

          <Link
            href={empty ? '/ver' : '/pagar'}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl py-4 text-sm sm:text-base font-bold text-white active:scale-95 transition-transform ${empty ? 'opacity-70' : ''}`}
            style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.3)' }}
          >
            {empty ? <ShoppingCart size={17} /> : <CreditCard size={17} />}
            {empty ? 'Agregar acceso' : 'Ir al pago'}
          </Link>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={12} className="flex-shrink-0" style={{ color: 'var(--scai-teal)' }} />
              Pago seguro con encriptación SSL
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
