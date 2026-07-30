'use client'

import Image from 'next/image'
import { Play } from 'lucide-react'

const IMG = {
  bola: '/imagenes/iamgen oficial.jpg',
  lluvia: '/imagenes/Lluvia de Inmunoglobulina.png',
  adherida: '/imagenes/Inmunoglobulina adeherida.jpg',
} as const

const feather =
  '[mask-image:radial-gradient(ellipse_72%_68%_at_50%_50%,#000_18%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_72%_68%_at_50%_50%,#000_18%,transparent_100%)]'

const featherLg =
  '[mask-image:radial-gradient(ellipse_88%_82%_at_50%_50%,#000_12%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_88%_82%_at_50%_50%,#000_12%,transparent_100%)]'

const featherSide =
  '[mask-image:radial-gradient(ellipse_90%_100%_at_100%_45%,#000_8%,transparent_72%)] [-webkit-mask-image:radial-gradient(ellipse_90%_100%_at_100%_45%,#000_8%,transparent_72%)]'

export function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute -right-[4%] top-[4%] h-[85%] w-[55%] opacity-[0.06] dark:opacity-[0.14] hidden sm:block ${featherSide}`}>
        <Image src={IMG.lluvia} alt="" fill className="object-cover object-center scale-110" sizes="55vw" quality={75} />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 90% at 0% 50%, var(--background) 0%, transparent 55%), radial-gradient(ellipse 70% 80% at 100% 30%, transparent 40%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background: 'radial-gradient(ellipse 80% 90% at 0% 50%, #0E2035 0%, transparent 58%)',
          }}
        />
      </div>
    </div>
  )
}

export function HeroVisual() {
  return (
    <div className={`relative w-full ${featherLg}`}>
      <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-auto lg:h-[min(400px,50vh)] w-full">
        <Image
          src={IMG.bola}
          alt=""
          fill
          priority
          quality={88}
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover object-[24%_center] scale-[1.08] brightness-[0.9] contrast-[0.94] saturate-[0.82] dark:brightness-100 dark:contrast-100 dark:saturate-100"
        />
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background: `
              linear-gradient(105deg, var(--background) 0%, color-mix(in srgb, var(--background) 40%, transparent) 38%, transparent 55%),
              linear-gradient(to top, color-mix(in srgb, var(--background) 88%, transparent) 0%, color-mix(in srgb, var(--background) 35%, transparent) 22%, transparent 42%)
            `,
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background: `
              linear-gradient(105deg, rgba(14,32,53,0.55) 0%, transparent 45%),
              linear-gradient(to top, rgba(11,25,40,0.82) 0%, rgba(11,25,40,0.28) 24%, transparent 44%)
            `,
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[38%]"
          style={{
            background: 'linear-gradient(to top, rgba(11,25,40,0.55) 0%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
          <div
            className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-white/25 backdrop-blur-md"
            style={{ background: 'rgba(11,25,40,0.45)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}
          >
            <Play size={22} className="text-white/90 ml-1" fill="currentColor" />
          </div>
        </div>
        <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm"
          style={{ background: 'rgba(11,25,40,0.5)' }}>
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--scai-teal)' }} />
          <span className="text-[11px] font-semibold text-white/85">Inmunología clínica</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--scai-teal)' }}>
            III Jornadas Regionales
          </p>
          <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
            Cuando el Sistema Inmune Falla
          </h3>
          <p className="text-xs text-white/50 mt-1.5">15 expositores · 4 módulos · CONACEM</p>
        </div>
      </div>
    </div>
  )
}

export function HeroMobileVisual() {
  return (
    <div className={`relative mt-8 md:hidden w-full max-w-sm mx-auto ${featherLg}`}>
      <div className="relative aspect-[16/10] w-full">
        <Image src={IMG.adherida} alt="" fill className="object-cover object-center brightness-[0.9] saturate-[0.85] dark:brightness-100 dark:saturate-100" sizes="100vw" quality={80} />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(11,25,40,0.75) 0%, rgba(11,25,40,0.2) 30%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 z-[15] flex items-center justify-center pointer-events-none">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 backdrop-blur-md"
            style={{ background: 'rgba(11,25,40,0.45)', boxShadow: '0 6px 24px rgba(0,0,0,0.3)' }}
          >
            <Play size={18} className="text-white/90 ml-0.5" fill="currentColor" />
          </div>
        </div>
        <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm"
          style={{ background: 'rgba(11,25,40,0.5)' }}>
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--scai-teal)' }} />
          <span className="text-[10px] font-semibold text-white/85">Grabación</span>
        </div>
      </div>
    </div>
  )
}

export function StatsDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-y-0 right-0 w-[70%] ${featherSide}`}>
        <Image
          src={IMG.adherida}
          alt=""
          fill
          className="object-cover object-right opacity-[0.05] dark:opacity-[0.1] brightness-[0.92] saturate-[0.85] dark:brightness-100 dark:saturate-100"
          sizes="70vw"
          quality={70}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background from-25% via-background/98 to-background dark:from-[#0B1928] dark:via-[#0B1928]/97 dark:to-[#0B1928]" />
    </div>
  )
}

export function ModulosDecor() {
  return (
    <div className={`pointer-events-none absolute right-0 top-0 h-full w-[min(45%,300px)] opacity-[0.05] dark:opacity-[0.11] ${featherSide}`} aria-hidden>
      <Image src={IMG.lluvia} alt="" fill className="object-cover object-top scale-105" sizes="300px" quality={70} />
      <div className="absolute inset-0 bg-gradient-to-l from-card from-20% to-transparent dark:from-[#0E2035] dark:from-25%" />
    </div>
  )
}

export function QuoteDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-0 ${featherLg}`}>
        <Image
          src={IMG.bola}
          alt=""
          fill
          className="object-cover object-center opacity-[0.06] dark:opacity-[0.14] brightness-[0.9] saturate-[0.82] dark:brightness-100 dark:saturate-100"
          sizes="100vw"
          quality={70}
        />
      </div>
      <div className="absolute inset-0 bg-background/94 dark:bg-[#0B1928]/88" />
    </div>
  )
}

export function AntesAhoraImage() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-0 ${feather}`}>
        <Image
          src={IMG.adherida}
          alt=""
          fill
          className="object-cover opacity-[0.14] dark:opacity-[0.28] brightness-[0.92] saturate-[0.88] dark:brightness-100 dark:saturate-100"
          sizes="400px"
          quality={70}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-card/98 via-card/95 to-card/88 dark:from-[#0B1928]/94 dark:via-[#0B1928]/88 dark:to-[#0B1928]/78" />
    </div>
  )
}

export function CtaDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-0 ${featherLg}`}>
        <Image
          src={IMG.lluvia}
          alt=""
          fill
          className="object-cover object-[center_25%] opacity-[0.08] dark:opacity-[0.2] brightness-[0.9] saturate-[0.85] dark:brightness-100 dark:saturate-100"
          sizes="100vw"
          quality={75}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-card from-20% via-card/96 to-card/88 dark:from-[#0B1928] dark:from-30% dark:via-[#0B1928]/92 dark:to-[#0B1928]/75" />
    </div>
  )
}
