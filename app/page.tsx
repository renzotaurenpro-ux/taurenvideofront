'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Check, X } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import {
  HeroDecor,
  HeroVisual,
  HeroMobileVisual,
  StatsDecor,
  ModulosDecor,
  QuoteDecor,
  AntesAhoraImage,
  CtaDecor,
} from '@/components/HomeDecor'
import ScaiLogo from '../Logotipo-SCAI.png'
import { fetchPublishedCourse } from '@/lib/courses'
import { PONENTES, ponenteFoto, ponenteIniciales } from '@/lib/ponentes'

const MODULOS = [
  {
    num: '01',
    title: 'Errores Innatos de la Inmunidad',
    desc: 'Bases moleculares y fenotípicas de las inmunodeficiencias primarias. Diagnóstico diferencial y abordaje clínico actualizado.',
    ponentes: ['Dra. Ligia Rodríguez', 'Dra. Soledad Pérez Saldías', 'Dra. Daniela Budinich Almarza', 'Dr. Francisco Roa'],
  },
  {
    num: '02',
    title: 'Manifestaciones Clínicas Complejas',
    desc: 'Presentaciones atípicas, solapamiento con enfermedades autoinmunes y casos clínicos multidisciplinarios.',
    ponentes: ['Dra. María de los Ángeles Morales', 'Dra. Bárbara Cid', 'Dra. Evelyn Silva', 'Dra. Patricia Vergara'],
  },
  {
    num: '03',
    title: 'Diagnóstico y Laboratorio',
    desc: 'Interpretación de estudios inmunológicos avanzados, citometría de flujo y genética molecular en la práctica clínica.',
    ponentes: ['Dr. Nicolás Faúndes Gandolfo', 'Dra. Ilennee Díaz Basualto', 'Dra. Lurimar Manrique Centeno', 'Dra. Pamela Méndez Barría'],
  },
  {
    num: '04',
    title: 'Tratamiento y Perspectivas',
    desc: 'Terapias de reemplazo, inmunomodulación, trasplante y terapia génica. Nuevas moléculas y ensayos clínicos.',
    ponentes: ['Dr. Francisco Cammarata', 'Dra. Fabiola Fernández Quezada', 'Dr. Alfonso Hernández', 'Dr. Mervin Piñones'],
  },
]

function PonenteAvatar({ nombre, size = 52 }: { nombre: string; size?: number }) {
  const foto = ponenteFoto(nombre)
  const px = `${Math.round(size * 2)}px`
  if (foto) {
    return (
      <div
        className="relative flex-shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size, border: '1px solid rgba(18,180,198,0.25)' }}
      >
        <Image
          src={foto}
          alt={nombre}
          fill
          sizes={px}
          quality={100}
          className="object-cover object-top"
        />
      </div>
    )
  }
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size > 48 ? 12 : 11,
        background: 'rgba(18,180,198,0.12)',
        border: '1px solid rgba(18,180,198,0.25)',
        color: 'var(--scai-teal)',
      }}
    >
      {ponenteIniciales(nombre)}
    </div>
  )
}

function SpeakerCard({ nombre, cv, index }: { nombre: string; cargo: string; cv: string; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative overflow-hidden rounded-xl border cursor-default"
      style={{
        height: hovered ? '168px' : '100px',
        borderColor: hovered ? 'rgba(18,180,198,0.4)' : 'var(--border)',
        transition: 'height 0.3s ease, border-color 0.3s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="absolute inset-0 flex items-center gap-3.5 px-4"
        style={{
          opacity: hovered ? 0 : 1,
          transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'opacity 0.25s, transform 0.25s',
        }}
      >
          <PonenteAvatar nombre={nombre} size={52} />
        <div>
          <p className="text-sm font-medium leading-snug">{nombre}</p>
          <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">{String(index + 1).padStart(2, '0')}</p>
        </div>
      </div>

      <div
        className="absolute inset-0 flex flex-col justify-start px-4 pt-4 pb-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.25s, transform 0.25s',
          background: 'rgba(18,180,198,0.07)',
        }}
      >
        <p className="text-[11px] font-semibold leading-snug line-clamp-2 mb-2 shrink-0" style={{ color: 'var(--scai-teal)' }}>
          {nombre}
        </p>
        <p className="text-[10px] leading-relaxed text-foreground/65">{cv}</p>
      </div>
    </div>
  )
}

function useCountUp(target: number, duration = 2000, active = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, active])
  return count
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [activeModulo, setActiveModulo] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)
  const [priceClp, setPriceClp] = useState<number | null>(null)

  const cntSpeakers = useCountUp(16, 1800, statsVisible)
  const cntPercent = useCountUp(100, 2200, statsVisible)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    let cancelled = false
    fetchPublishedCourse()
      .then(c => {
        if (cancelled) return
        const p = typeof c?.priceClp === 'number' && Number.isFinite(c.priceClp) ? c.priceClp : null
        setPriceClp(p)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [mounted])

  const priceText = (priceClp ?? 25000).toLocaleString('es-CL')

  useEffect(() => {
    if (!mounted || !statsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [mounted])

  if (!mounted) return <main className="home-soft min-h-screen bg-background" />

  return (
    <main className="home-soft min-h-screen bg-background text-foreground">

      <nav className="fixed top-0 z-50 w-full backdrop-blur-md border-b border-border bg-background/92 dark:border-white/5 dark:bg-[rgba(11,25,40,0.85)]">
        <div className="mx-auto max-w-7xl px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="h-9 sm:h-12 w-auto flex-shrink-0">
            <Image
              src={ScaiLogo}
              alt="SCAI"
              priority
              className="h-9 sm:h-12 w-auto block dark:hidden"
              style={{ filter: 'invert(1) brightness(0)' }}
            />
            <Image
              src={ScaiLogo}
              alt="SCAI"
              priority
              className="h-9 sm:h-12 w-auto hidden dark:block"
            />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full px-2.5 sm:px-2 py-2 text-[11px] sm:text-sm font-semibold border transition-colors whitespace-nowrap"
              style={{ borderColor: 'rgba(18,180,198,0.35)', color: 'var(--scai-teal)', background: 'rgba(18,180,198,0.08)' }}
            >
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Link>
            <Link
              href="/registro"
              className="hidden md:inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border transition-colors"
              style={{ borderColor: 'rgba(18,180,198,0.35)', color: 'var(--scai-teal)', background: 'rgba(18,180,198,0.08)' }}
            >
              Registrarme
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-sm font-semibold text-white transition-opacity hover:opacity-85 flex-shrink-0"
              style={{ background: 'var(--scai-teal)' }}
            >
              <ShoppingCart size={13} className="flex-shrink-0" />
              <span className="hidden sm:inline">{`Comprar — $${priceText} + IVA`}</span>
              <span className="sm:hidden tabular-nums">{`$${priceText}`}</span>
            </Link>
          </div>
        </div>
      </nav>

      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-5 sm:px-8 pt-24 pb-8 bg-gradient-to-br from-background via-secondary/80 to-background dark:from-[#0B1928] dark:via-[#0E2035] dark:to-[#0B2240]"
      >
        <HeroDecor />
        <div
          className="pointer-events-none absolute inset-0 dark:hidden"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 72% 30%, rgba(18,180,198,0.035) 0%, transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 72% 30%, rgba(18,180,198,0.07) 0%, transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 dark:hidden"
          style={{ background: 'linear-gradient(90deg, var(--background) 0%, transparent 38%, transparent 72%, color-mix(in srgb, var(--background) 40%, transparent) 100%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden dark:block"
          style={{ background: 'linear-gradient(90deg, #0B1928 0%, transparent 40%, transparent 70%, rgba(14,32,53,0.35) 100%)' }}
        />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 dark:block hidden"
          style={{ background: 'linear-gradient(to top, rgba(11,25,40,0.6) 0%, transparent 100%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 dark:hidden block"
          style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--background) 92%, transparent) 0%, transparent 100%)' }} />

        <div className="relative z-10 mx-auto w-full max-w-7xl flex items-start justify-between pt-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground dark:text-white/35">Jornadas Regionales</p>
          <p className="text-[11px] text-muted-foreground tabular-nums dark:text-white/25">01</p>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 grid md:grid-cols-2 gap-8 md:gap-12 items-center py-14 md:py-0">
          <div>
            <div className="mb-7">
              <span
                className="inline-block rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em]"
                style={{ borderColor: 'rgba(18,180,198,0.35)', color: 'var(--scai-teal)' }}
              >
                19 Junio 2026 · Online · Acreditado CONACEM
              </span>
            </div>

            <h1 className="mb-8 font-black leading-[0.88] tracking-tight text-foreground/90 dark:text-white"
              style={{ fontSize: 'clamp(2.6rem, 7vw, 6rem)' }}>
              Cuando el<br />
              <span style={{ color: 'var(--scai-teal)' }}>Sistema</span><br />
              Inmune Falla
            </h1>

            <p className="text-muted-foreground dark:text-white/45 text-sm sm:text-base max-w-xs leading-relaxed mb-6">
              III Jornadas Regionales de Inmunología Clínica — Desafíos en Errores Innatos de la Inmunidad.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/registro"
                className="self-start inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-80 shadow-[0_6px_24px_rgba(18,180,198,0.16)] dark:shadow-[0_8px_32px_rgba(18,180,198,0.32)]"
                style={{ background: 'var(--scai-teal)' }}
              >
                <ShoppingCart size={15} />
                {`$${priceText} + IVA — Obtener acceso`}
              </Link>
              <Link href="/registro" className="text-xs text-muted-foreground hover:text-foreground dark:text-white/30 dark:hover:text-white/60 pl-1 transition-colors">
                Soy nuevo/a · Registrarme →
              </Link>
              <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground dark:text-white/30 dark:hover:text-white/60 pl-1 transition-colors">
                Ya tengo acceso →
              </Link>
            </div>
            <HeroMobileVisual />
          </div>

          <div className="relative hidden md:block w-full max-w-lg lg:max-w-none mx-auto">
            <HeroVisual />
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl flex items-end justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground dark:text-white/25 text-xs">
            <span>Scroll</span>
            <span>↓</span>
          </div>
          <div className="flex items-end gap-8 sm:gap-12 text-right">
            {[
              { label: 'Organiza', value: 'SCAI' },
              { label: 'Año', value: '2026' },
              { label: 'Alcance', value: 'Online' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-white/25">{label}</p>
                <p className="text-sm font-semibold text-foreground/70 dark:text-white/60 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef} className="relative border-b border-border overflow-hidden">
        <StatsDecor />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: statsVisible ? cntSpeakers : 0, suffix: '', label: 'Expositores invitados' },
              { value: 4, suffix: '', label: 'Módulos temáticos' },
              { value: statsVisible ? cntPercent : 0, suffix: '%', label: 'Online — desde cualquier lugar' },
              { value: 1, suffix: '', label: 'Acreditación CONACEM oficial' },
            ].map(({ value, suffix, label }, i) => (
              <div key={i} className="border-r border-border last:border-r-0 px-5 sm:px-8 py-10 sm:py-14 first:pl-0 [&:nth-child(2)]:border-r-0 md:[&:nth-child(2)]:border-r">
                <p className="text-5xl sm:text-6xl font-black tabular-nums leading-none" style={{ color: 'var(--scai-teal)' }}>
                  {value}{suffix}
                </p>
                <p className="mt-3 text-xs text-muted-foreground leading-snug max-w-[140px]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28 overflow-hidden">
        <div
          className="pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 w-40 sm:w-52 h-40 sm:h-52 opacity-[0.06] dark:opacity-[0.14] hidden md:block [mask-image:radial-gradient(ellipse_70%_65%_at_50%_50%,#000_15%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_70%_65%_at_50%_50%,#000_15%,transparent_100%)]"
          aria-hidden
        >
          <Image src="/imagenes/Inmunoglobulina.png" alt="" fill className="object-contain" unoptimized />
        </div>
        <div className="relative z-10 grid md:grid-cols-[240px_1fr] gap-10 md:gap-24">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Descripción</p>
          </div>
          <p className="text-lg sm:text-xl leading-relaxed text-foreground/60 max-w-2xl">
            Las III Jornadas Regionales de Inmunología Clínica reúnen a 16 especialistas de Chile y el mundo para abordar los desafíos más complejos en Errores Innatos de la Inmunidad — actualización médica continua acreditada por CONACEM, disponible en formato online con acceso completo a la grabación.
          </p>
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8">
            {[
              { label: 'Fecha', value: '19 Junio 2026' },
              { label: 'Modalidad', value: 'Online · Cupos limitados' },
              { label: 'Acreditación', value: 'CONACEM' },
                { label: 'Inversión', value: `$${priceText} + IVA · Pago único` },
            ].map(({ label, value }) => (
              <div key={label} className="pr-6">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-border bg-card overflow-hidden">
        <ModulosDecor />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid md:grid-cols-[240px_1fr] gap-10 md:gap-24">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">4 Módulos</p>
              <div className="flex flex-row md:flex-col gap-2 flex-wrap">
                {MODULOS.map((m, i) => (
                  <button
                    key={m.num}
                    onClick={() => setActiveModulo(i)}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all"
                    style={activeModulo === i
                      ? { background: 'rgba(18,180,198,0.12)', color: 'var(--scai-teal)' }
                      : { color: 'var(--muted-foreground)' }
                    }
                  >
                    <span className="text-[10px] tabular-nums opacity-60">{m.num}</span>
                    <span className="hidden md:inline leading-snug">{m.title.split(' ').slice(0, 3).join(' ')}…</span>
                    <span className="md:hidden">{m.num}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Módulo {MODULOS[activeModulo].num}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight">
                {MODULOS[activeModulo].title}
              </h2>
              <p className="text-base text-foreground/60 leading-relaxed mb-8 max-w-lg">
                {MODULOS[activeModulo].desc}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                {MODULOS[activeModulo].ponentes.map((p, i) => (
                  <div key={p} className="flex items-center gap-3 border-b border-border py-3.5 pr-6">
                    <span className="text-[10px] tabular-nums text-muted-foreground w-5">{String(i + 1).padStart(2, '0')}</span>
                    <PonenteAvatar nombre={p} size={40} />
                    <span className="text-sm font-medium">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border overflow-hidden bg-background dark:bg-gradient-to-br dark:from-[#0B1928] dark:to-[#0E2035]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40 mb-16">Antes vs Ahora</p>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="rounded-2xl border p-7 sm:p-9 bg-card/90 dark:bg-white/[0.03] border-border/80 dark:border-white/8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground dark:text-white/30 mb-6">La forma antigua</p>
              <p className="text-muted-foreground dark:text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
                Para acceder al conocimiento de expertos había que desplazarse, pagar alojamiento, perder días de trabajo y aún así perderse ponencias por solapamiento de horarios.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  'Asistencia presencial obligatoria',
                  'Costo de viaje y alojamiento',
                  'Sin grabación disponible',
                  'Acceso limitado por cupos físicos',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-muted dark:bg-white/8">
                      <X size={10} className="text-muted-foreground dark:text-white/30" />
                    </div>
                    <span className="text-xs text-muted-foreground dark:text-white/35">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border p-7 sm:p-9 bg-card/90 dark:bg-[rgba(18,180,198,0.06)]"
              style={{ borderColor: 'rgba(18,180,198,0.22)' }}>
              <AntesAhoraImage />
              <div className="relative z-10">
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'var(--scai-teal)' }}>La forma nueva</p>
              <p className="text-foreground/70 dark:text-white/70 text-sm leading-relaxed mb-8 max-w-sm">
                Accede a los 16 mejores especialistas en inmunología clínica desde donde estés, con grabación HD disponible en el momento y acreditación CONACEM incluida.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  '100% online — sin desplazamiento',
                  'Grabación HD disponible de inmediato',
                  'Acreditación CONACEM oficial',
                  `$${priceText} + IVA · Pago único`,
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'rgba(18,180,198,0.2)' }}>
                      <Check size={10} style={{ color: 'var(--scai-teal)' }} />
                    </div>
                    <span className="text-xs text-foreground/70 dark:text-white/70">{item}</span>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-border overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 dark:hidden" style={{ background: 'linear-gradient(135deg, rgba(18,180,198,0.02) 0%, transparent 55%)' }} />
        <div className="pointer-events-none absolute inset-0 hidden dark:block" style={{ background: 'linear-gradient(135deg, rgba(18,180,198,0.04) 0%, transparent 60%)' }} />
        <QuoteDecor />
        <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28 text-center">
          <p className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-8 text-foreground/85">
            &ldquo;Actualización de primer nivel en inmunología clínica,{' '}
            <span style={{ color: 'var(--scai-teal)' }}>sin salir de tu consulta.</span>&rdquo;
          </p>
          <p className="text-sm text-muted-foreground">
            Sociedad Chilena de Alergia e Inmunología — SCAI
          </p>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid md:grid-cols-[240px_1fr] gap-10 md:gap-24">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Expositores</p>
              <p className="mt-5 font-black leading-none" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--scai-teal)' }}>
                16
              </p>
              <p className="text-sm text-muted-foreground mt-1">especialistas</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PONENTES.map(({ nombre, cargo, cv }, i) => (
                <SpeakerCard key={nombre} nombre={nombre} cargo={cargo} cv={cv} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
          <div className="grid md:grid-cols-[240px_1fr] gap-10 md:gap-24">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">¿Qué incluye?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-0">
              {[
                { num: '01', title: 'Grabación HD 1080p', desc: 'Acceso completo a todas las ponencias en alta definición.' },
                { num: '02', title: 'Acceso Seguro', desc: 'Sistema anticopia. Una cuenta personal, un dispositivo.' },
                { num: '03', title: 'Acreditación CONACEM', desc: 'Jornada con acreditación oficial para educación médica continua.' },
                { num: '04', title: 'Acceso Inmediato', desc: 'Disponible tras el pago, sin esperas ni procesos adicionales.' },
                { num: '05', title: '16 Expositores · 4 Módulos', desc: 'Especialistas organizados en 4 módulos temáticos de inmunología.' },
                { num: '06', title: 'Contenido Protegido', desc: 'Tecnología anticopia. Distribución no autorizada prohibida.' },
              ].map(({ num, title, desc }) => (
                <div key={title} className="border-t border-border pt-5 pb-8">
                  <p className="text-[10px] tabular-nums text-muted-foreground mb-4">{num}</p>
                  <h3 className="font-semibold text-sm mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-card dark:bg-gradient-to-br dark:from-[#0B1928] dark:to-[#0E2035]">
        <CtaDecor />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: 'var(--scai-teal)' }}>
              Sociedad Chilena de Alergia e Inmunología
            </p>
            <h2 className="font-black text-foreground dark:text-white leading-[0.9]" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
              Accede a las<br />
              <span style={{ color: 'var(--scai-gold)' }}>Jornadas</span><br />
              ahora
            </h2>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Link
              href="/carrito"
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold text-white transition-opacity hover:opacity-85 shadow-[0_6px_28px_rgba(18,180,198,0.18)] dark:shadow-[0_8px_40px_rgba(18,180,198,0.4)]"
              style={{ background: 'var(--scai-teal)' }}
            >
              <ShoppingCart size={16} />
              {`Comprar acceso — $${priceText} + IVA`}
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground dark:text-white/35 dark:hover:text-white/60 pl-1 transition-colors">
              Ya tengo acceso →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-col items-center gap-5 text-xs text-muted-foreground">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-auto">
                <Image
                  src={ScaiLogo}
                  alt="SCAI"
                  className="h-5 w-auto block dark:hidden"
                  style={{ filter: 'invert(1) brightness(0)' }}
                />
                <Image
                  src={ScaiLogo}
                  alt="SCAI"
                  className="h-5 w-auto hidden dark:block"
                />
              </div>
              <span className="hidden sm:inline">Sociedad Chilena de Alergia e Inmunología</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="https://www.scai.cl" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">www.scai.cl</a>
              <a href="https://instagram.com/scai.cl" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">@scai.cl</a>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Sitio desarrollado por{' '}
            <a
              href="https://taurenproeventos.cl/"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium transition-colors hover:underline underline-offset-2"
              style={{ color: 'var(--scai-teal)' }}
            >
              Tauren Pro Eventos
            </a>
          </p>
        </div>
      </footer>

    </main>
  )
}
