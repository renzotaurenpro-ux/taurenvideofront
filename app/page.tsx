'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Shield, Clock, Award, Users, Lock, ShoppingCart, CalendarDays, MapPin, Microscope, FlaskConical, HeartPulse } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const PONENTES = [
  'Dra. Ligia Rodríguez',
  'Dra. Soledad Pérez',
  'Dra. Daniela Budinich',
  'Dr. Francisco Roa',
  'Dra. María de los Ángeles Morales',
  'Dra. Bárbara Cid Troncoso',
  'Dra. Evelyn Silva',
  'Dra. Patricia Vergara',
  'Dr. Nicolás Faundes',
  'Dra. Illene Díaz',
  'Dra. Lurimar Manrique',
  'Dra. Pamela Méndez',
  'Dr. Francisco Cammarata',
  'Dra. Fabiola Fernández',
  'Dr. Alonso Hernández',
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const precio = process.env.NEXT_PUBLIC_EVENTO_PRECIO || '99'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <main className="min-h-screen bg-background text-foreground" />
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0" style={{ background: 'var(--scai-teal)' }}>
              <Microscope size={15} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm leading-none">SCAI</span>
              <span className="text-muted-foreground text-xs block leading-none">Inmunología Clínica</span>
            </div>
            <span className="font-bold text-sm sm:hidden">SCAI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/carrito"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/80 px-3 py-2 text-sm font-medium hover:bg-card"
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">Carrito</span>
            </Link>
            <Link
              href="/login"
              className="rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold text-white whitespace-nowrap"
              style={{ background: 'var(--scai-teal)' }}
            >
              <span className="hidden sm:inline">Iniciar sesión</span>
              <span className="sm:hidden">Sesión</span>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center overflow-hidden pt-20"
        style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 50%, #0B2240 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 60% 30%, rgba(18,180,198,0.12) 0%, transparent 60%)' }} />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-4 sm:px-6 py-10 md:gap-10 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
              style={{ borderColor: 'rgba(18,180,198,0.4)', background: 'rgba(18,180,198,0.1)' }}>
              <FlaskConical size={12} className="flex-shrink-0" style={{ color: 'var(--scai-teal)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider leading-tight" style={{ color: 'var(--scai-teal)' }}>
                Sociedad Chilena de Alergia e Inmunología
              </span>
            </div>

            <h1 className="mb-3 text-3xl sm:text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl text-white">
              III Jornadas Regionales de{' '}
              <span style={{ color: 'var(--scai-teal)' }}>Inmunología Clínica</span>
            </h1>

            <p className="mb-1 text-base sm:text-xl font-black text-white leading-snug" style={{ color: 'var(--scai-gold)' }}>
              Cuando el Sistema Inmune Falla:
            </p>
            <p className="mb-5 text-base sm:text-lg text-white/70">
              Desafíos en Errores Innatos de la Inmunidad
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              {[
                { icon: CalendarDays, text: '19 Junio 2026' },
                { icon: MapPin, text: 'Online · Cupos limitados' },
                { icon: Award, text: 'Acreditado CONACEM' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs"
                  style={{ borderColor: 'rgba(18,180,198,0.25)', background: 'rgba(18,180,198,0.08)', color: 'rgba(255,255,255,0.75)' }}>
                  <Icon size={13} className="flex-shrink-0" style={{ color: 'var(--scai-teal)' }} />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/carrito"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold text-white active:scale-95 transition-transform"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 24px rgba(18,180,198,0.35)' }}
              >
                <ShoppingCart size={18} />
                Comprar acceso — ${precio} USD
              </Link>
              <Link href="/login" className="text-center text-sm font-medium text-white/50 hover:text-white/80">
                Ya tengo acceso →
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/35">
              <div className="flex items-center gap-1.5"><Shield size={13} /> Pago seguro</div>
              <div className="flex items-center gap-1.5"><Clock size={13} /> Acceso inmediato</div>
              <div className="flex items-center gap-1.5"><Lock size={13} /> Cuenta personal</div>
            </div>
          </div>

          <div className="relative order-1 md:order-2">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] blur-3xl"
              style={{ background: 'rgba(18,180,198,0.12)' }} />
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border shadow-2xl"
              style={{ borderColor: 'rgba(18,180,198,0.3)' }}>
              <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur">
                <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
                Grabación disponible
              </div>
              <div className="absolute inset-0 z-10" style={{ background: 'rgba(11,25,40,0.45)' }} />
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-[220px] sm:h-[320px] md:h-[380px] w-full object-cover blur-[2px] brightness-50"
                poster="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80"
              >
                <source src="https://cdn.coverr.co/videos/coverr-a-surgeon-prepares-for-an-operation-1579/1080p.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-5">
                <div className="rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-5 backdrop-blur-md"
                  style={{ background: 'rgba(11,25,40,0.75)' }}>
                  <p className="mb-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--scai-teal)' }}>
                    Conferencia destacada
                  </p>
                  <h3 className="text-base sm:text-xl font-bold text-white leading-snug">
                    Cuando el Sistema Inmune Falla
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-white/50">15 expositores · Acreditado CONACEM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-2">Dirigido a</p>
        <h2 className="text-center text-xl sm:text-2xl font-bold mb-8">Profesionales de la Salud</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { icon: HeartPulse, label: 'Médicos/as EDF', sub: 'Ex-generales de zona' },
            { icon: Users, label: 'Médicos/as de Familia', sub: '' },
            { icon: HeartPulse, label: 'Médicos/as Internistas', sub: '' },
            { icon: Users, label: 'Médicos/as Pediatras', sub: '' },
            { icon: Award, label: 'Otros Profesionales', sub: 'de la Salud' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:border-[var(--scai-teal)]/30">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(18,180,198,0.12)' }}>
                <Icon size={18} style={{ color: 'var(--scai-teal)' }} />
              </div>
              <p className="font-semibold text-xs sm:text-sm leading-snug">{label}</p>
              {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-2">Expositores</p>
        <h2 className="text-center text-xl sm:text-2xl font-bold mb-8">15 Especialistas Invitados</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
          {PONENTES.map(nombre => {
            const iniciales = nombre
              .replace('Dra. ', '').replace('Dr. ', '')
              .split(' ').slice(0, 2).map(n => n[0]).join('')
            return (
              <div key={nombre} className="rounded-2xl border border-border bg-card p-3 flex flex-col items-center text-center gap-2 transition-colors hover:border-[var(--scai-teal)]/20">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border flex items-center justify-center font-bold text-xs sm:text-sm"
                  style={{ background: 'rgba(18,180,198,0.12)', borderColor: 'rgba(18,180,198,0.3)', color: 'var(--scai-teal)' }}>
                  {iniciales}
                </div>
                <p className="text-[11px] sm:text-xs font-medium leading-tight">{nombre}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
        <h2 className="mb-8 text-center text-xs uppercase tracking-widest text-muted-foreground">¿Qué incluye?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: Play, title: 'Grabación HD 1080p', desc: 'Acceso completo a la grabación de todas las ponencias en alta definición.' },
            { icon: Shield, title: 'Acceso Seguro', desc: 'Sistema anticopia. Una cuenta, un dispositivo. El contenido no puede ser distribuido.' },
            { icon: Award, title: 'Acreditación CONACEM', desc: 'La jornada cuenta con acreditación oficial para educación médica continua.' },
            { icon: Clock, title: 'Acceso Inmediato', desc: 'Tras el pago, accede de inmediato sin esperas ni procesos complicados.' },
            { icon: Users, title: '15 Expositores', desc: 'Especialistas en inmunología, pediatría y medicina interna de Chile y el mundo.' },
            { icon: Lock, title: 'Contenido Protegido', desc: 'Tecnología anticopia. La grabación y distribución no autorizada está prohibida.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[var(--scai-teal)]/30">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'rgba(18,180,198,0.12)' }}>
                <Icon size={18} style={{ color: 'var(--scai-teal)' }} />
              </div>
              <h3 className="mb-1.5 font-semibold text-sm sm:text-base">{title}</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32 text-center">
        <div className="rounded-2xl sm:rounded-3xl border p-8 sm:p-12"
          style={{ borderColor: 'rgba(18,180,198,0.3)', background: 'linear-gradient(135deg, rgba(18,180,198,0.1) 0%, var(--card) 100%)' }}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--scai-teal)' }}>
            Sociedad Chilena de Alergia e Inmunología
          </p>
          <h2 className="mb-3 text-2xl sm:text-3xl font-bold leading-snug">
            III Jornadas Regionales de Inmunología Clínica
          </h2>
          <p className="mb-2 font-bold text-sm sm:text-base" style={{ color: 'var(--scai-gold)' }}>
            Cuando el Sistema Inmune Falla
          </p>
          <p className="mb-6 text-xs sm:text-sm text-muted-foreground">
            Pago único · Acceso completo a la grabación · Acreditado CONACEM
          </p>
          <Link
            href="/carrito"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white active:scale-95 transition-transform"
            style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 24px rgba(18,180,198,0.3)' }}
          >
            <ShoppingCart size={18} />
            Obtener acceso — ${precio} USD
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3 text-xs sm:text-sm text-muted-foreground text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2">
            <Microscope size={14} className="flex-shrink-0" style={{ color: 'var(--scai-teal)' }} />
            <span>SCAI · Sociedad Chilena de Alergia e Inmunología</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.scai.cl" target="_blank" rel="noreferrer" className="hover:text-foreground">www.scai.cl</a>
            <a href="https://instagram.com/scai.cl" target="_blank" rel="noreferrer" className="hover:text-foreground">@scai.cl</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
