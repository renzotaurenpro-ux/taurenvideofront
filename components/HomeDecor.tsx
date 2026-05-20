'use client'

import Image from 'next/image'
const IMG = {
  bola: '/imagenes/iamgen oficial.jpg',
  lluvia: '/imagenes/Lluvia de Inmunoglobulina.png',
  flotando: '/imagenes/Inmunoglobulina sobre flotando sobre celula.png',
  adherida: '/imagenes/Inmunoglobulina adeherida.jpg',
  igg: '/imagenes/Inmunoglobulina-IgG.png',
  mol: '/imagenes/Inmunoglobulina.png',
} as const

const maskSoft =
  'mask-[radial-gradient(ellipse_92%_88%_at_50%_50%,#000_45%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_92%_88%_at_50%_50%,#000_45%,transparent_100%)]'

const maskWide =
  'mask-[radial-gradient(ellipse_100%_90%_at_50%_48%,#000_38%,transparent_82%)] [-webkit-mask-image:radial-gradient(ellipse_100%_90%_at_50%_48%,#000_38%,transparent_82%)]'

const maskSide =
  'mask-[linear-gradient(to_left,transparent_0%,#000_28%,#000_72%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_left,transparent_0%,#000_28%,#000_72%,transparent_100%)]'

function EdgeFade() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] dark:hidden"
      style={{
        background: `
          radial-gradient(ellipse 115% 75% at 50% 108%, var(--background) 0%, transparent 58%),
          radial-gradient(ellipse 85% 65% at 0% 50%, color-mix(in srgb, var(--background) 70%, transparent) 0%, transparent 52%),
          radial-gradient(ellipse 85% 65% at 100% 50%, color-mix(in srgb, var(--background) 70%, transparent) 0%, transparent 52%),
          radial-gradient(ellipse 75% 55% at 50% -8%, color-mix(in srgb, var(--background) 55%, transparent) 0%, transparent 48%)
        `,
      }}
    />
  )
}

function EdgeFadeDark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2] hidden dark:block"
      style={{
        background: `
          radial-gradient(ellipse 115% 75% at 50% 108%, #0B1928 0%, transparent 58%),
          radial-gradient(ellipse 85% 65% at 0% 50%, rgba(11,25,40,0.65) 0%, transparent 52%),
          radial-gradient(ellipse 85% 65% at 100% 50%, rgba(11,25,40,0.65) 0%, transparent 52%),
          radial-gradient(ellipse 75% 55% at 50% -8%, rgba(11,25,40,0.5) 0%, transparent 48%)
        `,
      }}
    />
  )
}

function FloatImg({
  src,
  className,
  width,
  height,
}: {
  src: string
  className: string
  width: number
  height: number
}) {
  return (
    <div className={`${className} ${maskSoft}`}>
      <Image src={src} alt="" width={width} height={height} className="h-full w-full object-contain" unoptimized />
    </div>
  )
}

export function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute -right-[6%] top-[6%] h-[78%] w-[62%] opacity-[0.18] dark:opacity-[0.26] hidden sm:block ${maskSide}`}>
        <Image src={IMG.lluvia} alt="" fill className="object-cover object-center" sizes="60vw" quality={80} />
        <div className="absolute inset-0 bg-gradient-to-l from-background via-transparent to-transparent dark:from-[#0B1928] dark:via-transparent" />
      </div>
      <FloatImg src={IMG.igg} width={200} height={200} className="absolute left-[3%] top-[20%] h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 opacity-[0.32] dark:opacity-[0.4]" />
      <FloatImg src={IMG.mol} width={180} height={180} className="absolute right-[5%] bottom-[12%] h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 opacity-[0.24] dark:opacity-[0.32]" />
    </div>
  )
}

export function HeroVisual() {
  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute -inset-10 blur-[72px] opacity-70"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(18,180,198,0.2) 0%, transparent 70%)' }}
      />
      <div className={`relative ${maskWide}`}>
        <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-auto lg:h-[min(420px,52vh)] w-full">
          <Image
            src={IMG.bola}
            alt=""
            fill
            priority
            quality={88}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-[22%_center] scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1928]/95 via-[#0B1928]/25 to-transparent dark:from-[#0B1928] dark:via-[#0B1928]/30" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0B1928]/80 via-transparent to-transparent" />
          <div className={`absolute inset-2 sm:inset-3 ${maskSoft}`}>
            <Image
              src={IMG.flotando}
              alt=""
              fill
              className="object-contain object-bottom opacity-[0.5] mix-blend-screen dark:opacity-[0.58]"
              sizes="50vw"
              quality={85}
            />
          </div>
          <FloatImg
            src={IMG.igg}
            width={120}
            height={120}
            className="absolute right-2 top-8 z-[3] h-16 w-16 sm:h-20 sm:w-20 opacity-80"
          />
          <EdgeFade />
          <EdgeFadeDark />
          <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md"
            style={{ background: 'rgba(11,25,40,0.65)' }}>
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--scai-teal)' }} />
            <span className="text-[11px] font-semibold text-white/90">Inmunología clínica</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--scai-teal)' }}>
              III Jornadas Regionales
            </p>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
              Cuando el Sistema Inmune Falla
            </h3>
            <p className="text-xs text-white/55 mt-1.5">16 expositores · 4 módulos · CONACEM</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HeroMobileVisual() {
  return (
    <div className={`relative mt-8 md:hidden w-full max-w-sm mx-auto ${maskWide}`}>
      <div className="relative aspect-[16/10] w-full">
        <Image src={IMG.adherida} alt="" fill className="object-cover object-center" sizes="100vw" quality={80} />
        <EdgeFade />
        <EdgeFadeDark />
        <FloatImg src={IMG.igg} width={80} height={80} className="absolute right-4 top-4 z-[3] h-14 w-14 opacity-75" />
      </div>
    </div>
  )
}

export function StatsDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-0 ${maskSide}`}>
        <Image
          src={IMG.adherida}
          alt=""
          fill
          className="object-cover object-right opacity-[0.1] dark:opacity-[0.15]"
          sizes="100vw"
          quality={75}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background dark:from-[#0B1928] dark:via-[#0B1928]/95 dark:to-[#0B1928]" />
    </div>
  )
}

export function ModulosDecor() {
  return (
    <div className={`pointer-events-none absolute right-0 top-0 h-full w-[min(52%,360px)] opacity-[0.12] dark:opacity-[0.17] ${maskSide}`} aria-hidden>
      <Image src={IMG.lluvia} alt="" fill className="object-cover object-top" sizes="400px" quality={75} />
      <div className="absolute inset-0 bg-gradient-to-l from-card via-card/40 to-transparent dark:from-[#0E2035] dark:via-[#0E2035]/50" />
    </div>
  )
}

export function QuoteDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-0 ${maskWide}`}>
        <Image
          src={IMG.bola}
          alt=""
          fill
          className="object-cover object-center opacity-[0.16] dark:opacity-[0.22] scale-105"
          sizes="100vw"
          quality={75}
        />
      </div>
      <FloatImg
        src={IMG.mol}
        width={320}
        height={320}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vw,20rem)] h-[min(80vw,20rem)] opacity-[0.2] dark:opacity-[0.28]"
      />
      <div className="absolute inset-0 bg-background/80 dark:bg-[#0B1928]/82" />
    </div>
  )
}

export function AntesAhoraImage() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-0 ${maskSoft}`}>
        <Image
          src={IMG.adherida}
          alt=""
          fill
          className="object-cover opacity-[0.3] dark:opacity-[0.36]"
          sizes="400px"
          quality={70}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-card/96 via-card/88 to-card/75 dark:from-[#0B1928]/92 dark:via-[#0B1928]/85 dark:to-[#0B1928]/72" />
    </div>
  )
}

export function CtaDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`absolute inset-0 ${maskWide}`}>
        <Image
          src={IMG.lluvia}
          alt=""
          fill
          className="object-cover object-[center_20%] opacity-[0.22] dark:opacity-[0.3]"
          sizes="100vw"
          quality={80}
        />
      </div>
      <FloatImg
        src={IMG.flotando}
        width={400}
        height={400}
        className="absolute -right-4 bottom-0 w-52 sm:w-64 md:w-80 h-52 sm:h-64 md:h-80 opacity-[0.38] dark:opacity-[0.48]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-card/75 dark:from-[#0B1928] dark:via-[#0B1928]/90 dark:to-[#0B1928]/70" />
    </div>
  )
}
