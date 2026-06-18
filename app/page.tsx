'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import PageBackground from '@/components/PageBackground'
import ScaiLogo from '../Logotipo-SCAI.png'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <main className="min-h-screen bg-[#0B1928]" />
  }

  return (
    <main className="relative min-h-[100dvh] min-h-screen w-full overflow-hidden text-white">
      <PageBackground scene="login" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(18,180,198,0.14) 0%, transparent 68%), linear-gradient(180deg, rgba(11,25,40,0.35) 0%, rgba(11,25,40,0.88) 100%)',
        }}
      />

      <div className="absolute top-[max(1rem,env(safe-area-inset-top,0px)+0.75rem)] right-[max(1rem,env(safe-area-inset-right,0px)+0.75rem)] z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        <div
          className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border"
          style={{
            borderColor: 'rgba(18,180,198,0.28)',
            background: 'rgba(18,180,198,0.08)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          }}
        >
          <Image src={ScaiLogo} alt="SCAI" priority className="h-9 w-auto" />
        </div>

        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 mb-5">
          Sociedad Chilena de Alergia e Inmunología
        </p>

        <h1
          className="font-black leading-[0.95] tracking-tight"
          style={{ fontSize: 'clamp(2.4rem, 8vw, 4.5rem)' }}
        >
          Próximamente
        </h1>

        <div
          className="my-6 h-px w-16"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(18,180,198,0.7), transparent)' }}
        />

        <p className="max-w-md text-sm sm:text-base leading-relaxed text-white/62">
          Estamos preparando la plataforma oficial de las III Jornadas Regionales de Inmunología Clínica.
        </p>

        <div
          className="mt-8 inline-flex items-center rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em]"
          style={{
            borderColor: 'rgba(18,180,198,0.35)',
            color: 'var(--scai-teal)',
            background: 'rgba(18,180,198,0.1)',
          }}
        >
          19 Junio 2026 · Online · CONACEM
        </div>

        <p className="mt-10 max-w-sm text-xs leading-relaxed text-white/38">
          Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunología
        </p>
      </div>

      <footer className="relative z-10 border-t border-white/8 px-6 py-5">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center text-[11px] text-white/40 sm:flex-row sm:justify-between">
          <a
            href="https://www.scai.cl"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white/70"
          >
            www.scai.cl
          </a>
          <Link
            href="/certificado/asistencia"
            className="transition-colors hover:text-[var(--scai-teal)]"
          >
            Certificados de asistencia
          </Link>
          <a
            href="https://instagram.com/scai.cl"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white/70"
          >
            @scai.cl
          </a>
        </div>
      </footer>
    </main>
  )
}
