'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Check, X } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import ScaiLogo from '../Logotipo-SCAI.png'

const PONENTES = [
  { nombre: 'Dra. Ligia Rodríguez', cv: 'Especialista en Inmunodeficiencias Primarias. Docente universitaria y referente nacional en diagnóstico de errores innatos de la inmunidad.' },
  { nombre: 'Dra. Soledad Pérez', cv: 'Inmunóloga clínica con enfoque en enfermedades autoinflamatorias. Investigadora activa en patologías complejas del sistema inmune.' },
  { nombre: 'Dra. Daniela Budinich', cv: 'Pediatra inmunóloga. Especializada en inmunodeficiencias pediátricas y reconstitución inmune post-trasplante.' },
  { nombre: 'Dr. Francisco Roa', cv: 'Internista e inmunólogo. Experto en manifestaciones sistémicas de disregulación inmune en el adulto.' },
  { nombre: 'Dra. María de los Ángeles Morales', cv: 'Reumatóloga e inmunóloga. Especialista en solapamiento de enfermedades autoinmunes sistémicas.' },
  { nombre: 'Dra. Bárbara Cid Troncoso', cv: 'Inmunóloga clínica y alergóloga. Docente de posgrado en Universidad de Chile, foco en hipersensibilidad e inmunodeficiencia.' },
  { nombre: 'Dra. Evelyn Silva', cv: 'Médico internista con subespecialidad en inmunología. Investigadora en terapias biológicas para enfermedades autoinmunes.' },
  { nombre: 'Dra. Patricia Vergara', cv: 'Pediatra con mención en inmunología. Especializada en alergia alimentaria y dermatitis atópica grave en pediatría.' },
  { nombre: 'Dr. Nicolás Faundes', cv: 'Genetista clínico. Especialista en genómica de inmunodeficiencias primarias y asesoría genética familiar.' },
  { nombre: 'Dra. Illene Díaz', cv: 'Inmunóloga de laboratorio. Experta en citometría de flujo aplicada al diagnóstico de inmunodeficiencias.' },
  { nombre: 'Dra. Lurimar Manrique', cv: 'Médico inmunólogo con formación internacional. Especialista en errores innatos de la inmunidad en adultos.' },
  { nombre: 'Dra. Pamela Méndez', cv: 'Alergóloga e inmunóloga. Referente en diagnóstico y manejo de angioedema hereditario y déficit de complemento.' },
  { nombre: 'Dr. Francisco Cammarata', cv: 'Especialista en trasplante e inmunología. Experto en acondicionamiento y manejo post-trasplante de células madre.' },
  { nombre: 'Dra. Fabiola Fernández', cv: 'Inmunóloga clínica con enfoque en terapia de reemplazo con inmunoglobulinas y protocolos de infusión.' },
  { nombre: 'Dr. Alonso Hernández', cv: 'Médico inmunólogo e investigador clínico. Participante en ensayos de terapia génica para inmunodeficiencias severas.' },
  { nombre: 'Dra. Expositor/a por confirmar', cv: 'Información del expositor próximamente disponible.' },
]

const MODULOS = [
  {
    num: '01',
    title: 'Errores Innatos de la Inmunidad',
    desc: 'Bases moleculares y fenotípicas de las inmunodeficiencias primarias. Diagnóstico diferencial y abordaje clínico actualizado.',
    ponentes: ['Dra. Ligia Rodríguez', 'Dra. Soledad Pérez', 'Dra. Daniela Budinich', 'Dr. Francisco Roa'],
  },
  {
    num: '02',
    title: 'Manifestaciones Clínicas Complejas',
    desc: 'Presentaciones atípicas, solapamiento con enfermedades autoinmunes y casos clínicos multidisciplinarios.',
    ponentes: ['Dra. María de los Ángeles Morales', 'Dra. Bárbara Cid Troncoso', 'Dra. Evelyn Silva', 'Dra. Patricia Vergara'],
  },
  {
    num: '03',
    title: 'Diagnóstico y Laboratorio',
    desc: 'Interpretación de estudios inmunológicos avanzados, citometría de flujo y genética molecular en la práctica clínica.',
    ponentes: ['Dr. Nicolás Faundes', 'Dra. Illene Díaz', 'Dra. Lurimar Manrique', 'Dra. Pamela Méndez'],
  },
  {
    num: '04',
    title: 'Tratamiento y Perspectivas',
    desc: 'Terapias de reemplazo, inmunomodulación, trasplante y terapia génica. Nuevas moléculas y ensayos clínicos.',
    ponentes: ['Dr. Francisco Cammarata', 'Dra. Fabiola Fernández', 'Dr. Alonso Hernández', 'Dra. Expositor/a por confirmar'],
  },
]

function SpeakerCard({ nombre, cv, index }: { nombre: string; cv: string; index: number }) {
  const [hovered, setHovered] = useState(false)
  const iniciales = nombre
    .replace('Dra. ', '').replace('Dr. ', '')
    .split(' ').slice(0, 2).map((n: string) => n[0]).join('')
  const isDaniela =
    /daniela/i.test(nombre) &&
    (/(budinich|buchini)/i.test(nombre))
  return (
    <div
      className="relative overflow-hidden rounded-xl border cursor-default"
      style={{
        height: '80px',
        borderColor: hovered ? 'rgba(18,180,198,0.4)' : 'var(--border)',
        transition: 'border-color 0.3s',
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
          {isDaniela ? (
            <div
              className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full"
              style={{ border: '1px solid rgba(18,180,198,0.25)' }}
            >
              <Image
                src="/doctora-perfil.jpg.jpeg"
                alt={nombre}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(18,180,198,0.12)', border: '1px solid rgba(18,180,198,0.25)', color: 'var(--scai-teal)' }}
            >
              {iniciales}
            </div>
          )}
        <div>
          <p className="text-sm font-medium leading-snug">{nombre}</p>
          <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">{String(index + 1).padStart(2, '0')}</p>
        </div>
      </div>

      <div
        className="absolute inset-0 flex flex-col justify-center px-4 py-3"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.25s, transform 0.25s',
          background: 'rgba(18,180,198,0.07)',
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--scai-teal)' }}>
          {nombre}
        </p>
        <p className="text-[11px] leading-relaxed text-foreground/65">{cv}</p>
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

  const cntSpeakers = useCountUp(16, 1800, statsVisible)
  const cntPercent = useCountUp(100, 2200, statsVisible)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !statsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [mounted])

  if (!mounted) return <main className="min-h-screen bg-background" />

  return (
    <main className="min-h-screen bg-background text-foreground">

      <nav className="fixed top-0 z-50 w-full backdrop-blur-md border-b border-border bg-background/85 dark:border-white/5 dark:bg-[rgba(11,25,40,0.85)]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-3.5 flex items-center justify-between">
          <Image src={ScaiLogo} alt="SCAI" priority className="h-7 w-auto" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white/80 px-2 transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="hidden sm:inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border transition-colors"
              style={{ borderColor: 'rgba(18,180,198,0.35)', color: 'var(--scai-teal)', background: 'rgba(18,180,198,0.08)' }}
            >
              Registrarme
            </Link>
            <Link
              href="/carrito"
              className="inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: 'var(--scai-teal)' }}
            >
              <ShoppingCart size={13} />
              <span className="hidden sm:inline">Comprar — $25.000 + IVA</span>
              <span className="sm:hidden">$25.000</span>
            </Link>
          </div>
        </div>
      </nav>

      <section
        className="relative flex min-h-screen flex-col justify-between overflow-hidden px-5 sm:px-8 pt-24 pb-8 bg-gradient-to-br from-background via-secondary to-background dark:from-[#0B1928] dark:via-[#0E2035] dark:to-[#0B2240]"
      >
        <div className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 65% 25%, rgba(18,180,198,0.11) 0%, transparent 58%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 dark:block hidden"
          style={{ background: 'linear-gradient(to top, rgba(11,25,40,0.6) 0%, transparent 100%)' }} />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 dark:hidden block"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, transparent 100%)' }} />

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

            <h1 className="mb-8 font-black leading-[0.88] tracking-tight text-foreground dark:text-white"
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
                href="/carrito"
                className="self-start inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 32px rgba(18,180,198,0.32)' }}
              >
                <ShoppingCart size={15} />
                $25.000 + IVA — Obtener acceso
              </Link>
              <Link href="/registro" className="text-xs text-muted-foreground hover:text-foreground dark:text-white/30 dark:hover:text-white/60 pl-1 transition-colors">
                Soy nuevo/a · Registrarme →
              </Link>
              <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground dark:text-white/30 dark:hover:text-white/60 pl-1 transition-colors">
                Ya tengo acceso →
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="pointer-events-none absolute -inset-8 rounded-[2rem] blur-3xl"
              style={{ background: 'rgba(18,180,198,0.1)' }} />
            <div className="relative overflow-hidden rounded-2xl border shadow-2xl"
              style={{ borderColor: 'rgba(18,180,198,0.25)' }}>
              <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md"
                style={{ background: 'rgba(11,25,40,0.75)', border: '1px solid rgba(18,180,198,0.2)' }}>
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--scai-teal)' }} />
                <span className="text-[11px] font-semibold text-white/80">Grabación disponible</span>
              </div>
              <div className="relative h-[280px] lg:h-[360px] w-full">
                <iframe
                  src="https://player.vimeo.com/video/76979871?h=8272103f6e&title=0&byline=0&portrait=0&autoplay=1&muted=1&loop=1&background=1"
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute inset-0 pointer-events-none dark:block hidden" style={{ background: 'rgba(11,25,40,0.35)' }} />
                <div className="absolute inset-0 pointer-events-none dark:hidden block" style={{ background: 'rgba(255,255,255,0.25)' }} />
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 p-4"
                style={{ background: 'linear-gradient(to top, rgba(11,25,40,0.85) 0%, transparent 100%)' }}>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--scai-teal)' }}>
                  Conferencia destacada
                </p>
                <h3 className="text-base font-bold text-white leading-snug">
                  Cuando el Sistema Inmune Falla
                </h3>
                <p className="text-xs text-white/45 mt-1">16 expositores · 4 módulos · Acreditado CONACEM</p>
              </div>
            </div>
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

      <section ref={statsRef} className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
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

      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
        <div className="grid md:grid-cols-[240px_1fr] gap-10 md:gap-24">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Descripción</p>
          </div>
          <p className="text-lg sm:text-xl leading-relaxed text-foreground/70 max-w-2xl">
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
              { label: 'Inversión', value: '$25.000 + IVA · Pago único' },
            ].map(({ label, value }) => (
              <div key={label} className="pr-6">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-28">
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
                    {/daniela/i.test(p) && /budinich|buchini/i.test(p) ? (
                      <div className="relative h-6 w-6 overflow-hidden rounded-full border flex-shrink-0" style={{ borderColor: 'rgba(18,180,198,0.25)' }}>
                        <Image src="/doctora-perfil.jpg.jpeg" alt={p} fill sizes="24px" className="object-cover" />
                      </div>
                    ) : null}
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
            <div className="rounded-2xl border p-7 sm:p-9 bg-card dark:bg-white/[0.03] border-border dark:border-white/8">
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

            <div className="rounded-2xl border p-7 sm:p-9 bg-card dark:bg-[rgba(18,180,198,0.06)]"
              style={{ borderColor: 'rgba(18,180,198,0.3)' }}>
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'var(--scai-teal)' }}>La forma nueva</p>
              <p className="text-foreground/70 dark:text-white/70 text-sm leading-relaxed mb-8 max-w-sm">
                Accede a los 16 mejores especialistas en inmunología clínica desde donde estés, con grabación HD disponible en el momento y acreditación CONACEM incluida.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  '100% online — sin desplazamiento',
                  'Grabación HD disponible de inmediato',
                  'Acreditación CONACEM oficial',
                  '$25.000 + IVA · Pago único',
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
      </section>

      <section className="border-b border-border"
        style={{ background: 'linear-gradient(135deg, rgba(18,180,198,0.04) 0%, transparent 60%)' }}>
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-20 sm:py-28 text-center">
          <p className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-8">
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
              {PONENTES.map(({ nombre, cv }, i) => (
                <SpeakerCard key={nombre} nombre={nombre} cv={cv} index={i} />
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

      <section className="overflow-hidden bg-card dark:bg-gradient-to-br dark:from-[#0B1928] dark:to-[#0E2035]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
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
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-sm font-bold text-white transition-opacity hover:opacity-85"
              style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 40px rgba(18,180,198,0.4)' }}
            >
              <ShoppingCart size={16} />
              Comprar acceso — $25.000 + IVA
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground dark:text-white/35 dark:hover:text-white/60 pl-1 transition-colors">
              Ya tengo acceso →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Image src={ScaiLogo} alt="SCAI" className="h-5 w-auto" />
            <span className="hidden sm:inline">Sociedad Chilena de Alergia e Inmunología</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.scai.cl" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">www.scai.cl</a>
            <a href="https://instagram.com/scai.cl" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">@scai.cl</a>
          </div>
        </div>
      </footer>

    </main>
  )
}
