'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Maximize2, X } from 'lucide-react'

const IMG = {
  bola: '/imagenes/iamgen oficial.jpg',
  lluvia: '/imagenes/Lluvia de Inmunoglobulina.png',
  adherida: '/imagenes/Inmunoglobulina adeherida.jpg',
} as const

const HOME_VIDEO = '/videos/home.mp4'

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

function HeroVideoLightbox({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: 'rgba(4,10,18,0.96)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Video ampliado"
    >
      <div
        className="flex items-center justify-between gap-3 px-4 sm:px-6 border-b border-white/10"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
          paddingBottom: '0.75rem',
          background: 'rgba(8,18,32,0.95)',
        }}
      >
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--scai-teal)' }}>
            III Jornadas Regionales
          </p>
          <p className="text-sm font-semibold text-white truncate">Cuando el Sistema Inmune Falla</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold text-white border border-white/20 hover:bg-white/10 active:scale-[0.98] transition-colors flex-shrink-0"
          style={{ background: 'rgba(18,180,198,0.18)', minHeight: 44 }}
        >
          <X size={18} />
          Cerrar
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-2 sm:px-6"
        style={{
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          minHeight: 0,
        }}
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-5xl overflow-hidden rounded-xl sm:rounded-2xl border border-white/15 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          onClick={e => e.stopPropagation()}
        >
          <video
            src={HOME_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            controls
            controlsList="nodownload"
            className="w-full h-auto max-h-[min(70dvh,720px)] object-contain bg-black"
          />
        </div>
      </div>

      <div
        className="sm:hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
        style={{ background: 'rgba(8,18,32,0.95)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white"
          style={{ background: 'var(--scai-teal)', minHeight: 48 }}
        >
          <X size={18} />
          Cerrar video
        </button>
      </div>
    </div>,
    document.body,
  )
}

export function HeroVisual() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ampliar video"
          className="group relative block aspect-[16/10] sm:aspect-[5/4] lg:aspect-auto lg:h-[min(420px,52vh)] w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--scai-teal)]"
        >
          <video
            src={HOME_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              background: `
                linear-gradient(105deg, var(--background) 0%, color-mix(in srgb, var(--background) 35%, transparent) 32%, transparent 55%),
                linear-gradient(to top, color-mix(in srgb, var(--background) 80%, transparent) 0%, transparent 42%)
              `,
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background: `
                linear-gradient(105deg, rgba(14,32,53,0.45) 0%, transparent 42%),
                linear-gradient(to top, rgba(11,25,40,0.72) 0%, rgba(11,25,40,0.2) 28%, transparent 48%)
              `,
            }}
          />
          <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-sm max-w-[55%]"
            style={{ background: 'rgba(11,25,40,0.5)' }}>
            <div className="h-1.5 w-1.5 rounded-full animate-pulse flex-shrink-0" style={{ background: 'var(--scai-teal)' }} />
            <span className="text-[10px] sm:text-[11px] font-semibold text-white/85 truncate">Inmunología clínica</span>
          </div>
          <div
            className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[11px] font-semibold text-white backdrop-blur-sm"
            style={{ background: 'rgba(18,180,198,0.28)', border: '1px solid rgba(18,180,198,0.5)', minHeight: 36 }}
          >
            <Maximize2 size={14} />
            <span>Ampliar</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--scai-teal)' }}>
              III Jornadas Regionales
            </p>
            <h3 className="text-base sm:text-xl font-black text-white leading-snug">
              Cuando el Sistema Inmune Falla
            </h3>
            <p className="text-[11px] sm:text-xs text-white/50 mt-1.5">15 expositores · 4 módulos · CONACEM</p>
          </div>
        </button>
      </div>

      <HeroVideoLightbox open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function HeroMobileVisual() {
  return (
    <div className="relative mt-8 md:hidden w-full max-w-md mx-auto">
      <HeroVisual />
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
