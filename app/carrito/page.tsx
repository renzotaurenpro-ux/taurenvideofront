'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowLeft, CreditCard, Shield, ShoppingCart, Microscope, CalendarDays, Award, Users, Clock, CheckCircle2 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function CarritoPage() {
  const precio = Number(process.env.NEXT_PUBLIC_EVENTO_PRECIO || '99')
  const subtotal = useMemo(() => precio, [precio])
  const total = useMemo(() => subtotal, [subtotal])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-2">
            <Microscope size={15} className="text-cyan-500" />
            <span className="font-bold text-sm">SCAI · Inmunología</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-600/10 px-3 py-1.5 text-sm text-cyan-500">
              <ShoppingCart size={14} />
              <span className="font-semibold">1</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <h1 className="mb-6 flex items-center gap-3 text-xl font-bold">
            <ShoppingCart size={20} className="text-cyan-500" />
            Tu carrito
          </h1>

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-600/5 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-600/20 border border-cyan-500/30">
                <Microscope size={22} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-0.5">
                  Sociedad Chilena de Alergia e Inmunología
                </p>
                <h2 className="font-bold text-base leading-snug mb-1">
                  III Jornadas Regionales de Inmunología Clínica
                </h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-cyan-500" />
                    19 Junio 2026
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-cyan-500" />
                    15 expositores
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award size={13} className="text-cyan-500" />
                    Acreditado CONACEM
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-2xl font-black text-foreground">${precio}</p>
                <p className="text-xs text-muted-foreground">USD</p>
              </div>
            </div>
          </div>

          <ul className="mt-6 space-y-2">
            {[
              'Acceso completo a la grabación HD',
              'Sin límite de tiempo para ver la grabación',
              'Cuenta personal intransferible',
              'Acreditación CONACEM',
              'Soporte técnico incluido',
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 size={15} className="flex-shrink-0 text-cyan-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-5 font-bold text-lg">Resumen del pedido</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>III Jornadas de Inmunología Clínica</span>
              <span>${subtotal} USD</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-cyan-500">${total} USD</span>
            </div>
          </div>

          <Link
            href="/pagar"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-4 text-base font-bold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500"
          >
            <CreditCard size={18} />
            Ir al pago
          </Link>

          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield size={13} className="text-cyan-500" />
              Pago seguro con encriptación SSL
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={13} className="text-cyan-500" />
              Acceso inmediato tras el pago
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}
