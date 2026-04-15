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
      <nav className="fixed top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600">
              <Microscope size={15} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm leading-none">SCAI</span>
              <span className="text-muted-foreground text-xs block leading-none">Inmunología Clínica</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/carrito"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-2 text-sm font-medium text-foreground hover:bg-card"
            >
              <ShoppingCart size={16} />
              Carrito
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center top, rgba(6,182,212,0.15) 0%, rgba(8,8,8,0.05) 40%, transparent 100%)',
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:grid-cols-2">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-600/10 px-4 py-1.5">
              <FlaskConical size={13} className="text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                Sociedad Chilena de Alergia e Inmunología
              </span>
            </div>

            <h1 className="mb-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              III Jornadas Regionales de{' '}
              <span className="text-cyan-500">Inmunología Clínica</span>
            </h1>

            <p className="mb-2 max-w-xl text-lg font-semibold text-foreground/80 md:text-xl">
              Cuando el Sistema Inmune Falla:
            </p>
            <p className="mb-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              Desafíos en Errores Innatos de la Inmunidad
            </p>

            <div className="mb-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                <CalendarDays size={15} className="text-cyan-500" />
                <span>19 de Junio 2026</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                <MapPin size={15} className="text-cyan-500" />
                <span>Online · Cupos limitados</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2">
                <Award size={15} className="text-cyan-500" />
                <span>Acreditado por CONACEM</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/carrito"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-600/25 transition hover:scale-105 hover:bg-cyan-500"
              >
                <ShoppingCart size={18} />
                Comprar acceso — ${precio} USD
              </Link>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Ya tengo acceso →
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-8 text-sm text-muted-foreground/60">
              <div className="flex items-center gap-2"><Shield size={14} /> Pago seguro</div>
              <div className="flex items-center gap-2"><Clock size={14} /> Acceso inmediato</div>
              <div className="flex items-center gap-2"><Lock size={14} /> Cuenta personal</div>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-cyan-600/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
              <div className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
                <div className="h-2 w-2 rounded-full bg-white/40" />
                Grabación disponible
              </div>
              <div className="absolute inset-0 z-10 bg-black/40" />
              <video
                autoPlay
                muted
                loop
                playsInline
                className="h-[430px] w-full object-cover blur-[2px] brightness-60"
                poster="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80"
              >
                <source src="https://cdn.coverr.co/videos/coverr-a-surgeon-prepares-for-an-operation-1579/1080p.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-x-0 bottom-0 z-20 p-5">
                <div className="rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur">
                  <p className="mb-1 text-xs text-cyan-300 font-semibold uppercase tracking-wider">Conferencia destacada</p>
                  <h3 className="text-xl font-bold text-white leading-snug">
                    Cuando el Sistema Inmune Falla
                  </h3>
                  <p className="mt-1 text-sm text-white/60">15 expositores · Acreditado CONACEM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-3">Dirigido a</p>
        <h2 className="text-center text-2xl font-bold mb-10">Profesionales de la Salud</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: HeartPulse, label: 'Médicos/as EDF', sub: 'Ex-generales de zona' },
            { icon: Users, label: 'Médicos/as de Familia', sub: '' },
            { icon: HeartPulse, label: 'Médicos/as Internistas', sub: '' },
            { icon: Users, label: 'Médicos/as Pediatras', sub: '' },
            { icon: Award, label: 'Otros Profesionales', sub: 'de la Salud' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5 text-center hover:border-cyan-500/30 transition-colors">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/15">
                <Icon size={20} className="text-cyan-500" />
              </div>
              <p className="font-semibold text-sm">{label}</p>
              {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 pb-20">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-3">Expositores</p>
        <h2 className="text-center text-2xl font-bold mb-10">15 Especialistas Invitados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PONENTES.map(nombre => {
            const iniciales = nombre
              .replace('Dra. ', '')
              .replace('Dr. ', '')
              .split(' ')
              .slice(0, 2)
              .map(n => n[0])
              .join('')
            return (
              <div key={nombre} className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center text-center gap-3 hover:border-cyan-500/20 transition-colors">
                <div className="h-12 w-12 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  {iniciales}
                </div>
                <p className="text-xs font-medium text-foreground leading-tight">{nombre}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 pb-20">
        <h2 className="mb-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
          ¿Qué incluye?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Play, title: 'Grabación HD 1080p', desc: 'Acceso completo a la grabación de todas las ponencias en alta definición.' },
            { icon: Shield, title: 'Acceso Seguro', desc: 'Sistema anticopia. Una cuenta, un dispositivo. El contenido no puede ser distribuido.' },
            { icon: Award, title: 'Acreditación CONACEM', desc: 'La jornada cuenta con acreditación oficial para educación médica continua.' },
            { icon: Clock, title: 'Acceso Inmediato', desc: 'Tras el pago, accede de inmediato sin esperas ni procesos complicados.' },
            { icon: Users, title: '15 Expositores', desc: 'Especialistas en inmunología, pediatría y medicina interna de Chile y el mundo.' },
            { icon: Lock, title: 'Contenido Protegido', desc: 'Tecnología anticopia. La grabación y distribución no autorizada está prohibida.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-cyan-500/30">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600/15">
                <Icon size={20} className="text-cyan-500" />
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-32 text-center">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-card p-12">
          <p className="text-xs uppercase tracking-widest text-cyan-400 mb-3">Sociedad Chilena de Alergia e Inmunología</p>
          <h2 className="mb-4 text-3xl font-bold">III Jornadas Regionales de Inmunología Clínica</h2>
          <p className="mb-2 text-muted-foreground font-medium">Cuando el Sistema Inmune Falla</p>
          <p className="mb-8 text-sm text-muted-foreground">Pago único · Acceso completo a la grabación · Acreditado CONACEM</p>
          <Link
            href="/carrito"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-10 py-4 text-lg font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-cyan-500"
          >
            <ShoppingCart size={18} />
            Obtener acceso — ${precio} USD
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Microscope size={15} className="text-cyan-500" />
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
