'use client'

import Link from 'next/link'
import { Home, ArrowLeft, ChevronRight } from 'lucide-react'
import PageBackground from '@/components/PageBackground'

export type AttendanceNavStep = 'correo' | 'opciones' | 'examen' | 'resultado'

type Props = {
  step: AttendanceNavStep
  email?: string
  backHref?: string
  backLabel?: string
  wide?: boolean
  children: React.ReactNode
}

function stepHref(step: AttendanceNavStep, email?: string) {
  const q = email ? `?email=${encodeURIComponent(email)}` : ''
  switch (step) {
    case 'correo': return '/certificado/asistencia'
    case 'opciones': return `/certificado/asistencia/opciones${q}`
    case 'examen': return `/certificado/asistencia/examen${q}`
    case 'resultado': return `/certificado/asistencia/resultado${q}`
  }
}

function StepLink({
  id,
  current,
  email,
  label,
}: {
  id: AttendanceNavStep
  current: AttendanceNavStep
  email?: string
  label: string
}) {
  const active = id === current
  const done =
    (id === 'correo') ||
    (id === 'opciones' && email && ['opciones', 'examen', 'resultado'].includes(current)) ||
    (id === 'examen' && current === 'examen') ||
    (id === 'resultado' && current === 'resultado')

  if (!done) {
    return <span className="text-white/25">{label}</span>
  }

  if (active) {
    return <span className="text-[var(--scai-teal)] font-semibold">{label}</span>
  }

  return (
    <Link href={stepHref(id, email)} className="text-white/50 hover:text-white/80 transition-colors">
      {label}
    </Link>
  )
}

export default function AttendanceCertLayout({ step, email, backHref, backLabel, wide, children }: Props) {
  const defaultBack =
    step === 'opciones' ? '/certificado/asistencia'
    : step === 'examen' || step === 'resultado' ? stepHref('opciones', email)
    : undefined

  return (
    <div className="relative min-h-[100dvh] min-h-screen w-full">
      <PageBackground scene="login" />
      <Link
        href="/"
        className="fixed top-[max(1rem,env(safe-area-inset-top,0px)+0.75rem)] left-[max(1rem,env(safe-area-inset-left,0px)+0.75rem)] z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/80 hover:text-white border border-white/15 bg-[rgba(8,18,32,0.75)] hover:bg-[rgba(8,18,32,0.9)] backdrop-blur-md transition-colors"
      >
        <Home size={14} style={{ color: 'var(--scai-teal)' }} />
        Inicio
      </Link>
      <div className={`relative z-10 mx-auto px-4 pt-[max(4.5rem,calc(env(safe-area-inset-top,0px)+3.5rem))] pb-8 ${wide ? 'max-w-[840px]' : 'max-w-lg'}`}>
        {(backHref ?? defaultBack) && (
          <Link
            href={backHref ?? defaultBack!}
            className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white/85 mb-3 transition-colors"
          >
            <ArrowLeft size={14} />
            {backLabel ?? (step === 'opciones' ? 'Cambiar correo' : 'Volver al menú')}
          </Link>
        )}
        <nav className="flex flex-wrap items-center gap-1 text-[10px] uppercase tracking-wider mb-4 px-1">
          <StepLink id="correo" current={step} email={email} label="Correo" />
          <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
          <StepLink id="opciones" current={step} email={email} label="Opciones" />
          {step === 'examen' && (
            <>
              <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
              <span className="text-[var(--scai-teal)] font-semibold">Examen</span>
            </>
          )}
          {step === 'resultado' && (
            <>
              <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
              <span className="text-[var(--scai-teal)] font-semibold">Certificado</span>
            </>
          )}
        </nav>
        {children}
      </div>
    </div>
  )
}
