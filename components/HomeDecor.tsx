'use client'

import Image from 'next/image'

export function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/sin%20fondo/Inmunoglobulina-IgG.png"
        alt=""
        width={320}
        height={320}
        className="absolute -right-6 sm:right-4 top-[14%] w-36 sm:w-48 md:w-60 opacity-[0.06] dark:opacity-[0.09] select-none"
        unoptimized
      />
      <Image
        src="/sin%20fondo/Inmunoglobulina.png"
        alt=""
        width={280}
        height={280}
        className="absolute -left-10 sm:-left-4 bottom-[18%] w-32 sm:w-40 md:w-52 opacity-[0.05] dark:opacity-[0.08] select-none"
        unoptimized
      />
      <Image
        src="/sin%20fondo/Inmunoglobulina-separadas.png"
        alt=""
        width={240}
        height={240}
        className="absolute right-[12%] bottom-[8%] w-24 sm:w-32 opacity-[0.04] dark:opacity-[0.06] hidden md:block select-none"
        unoptimized
      />
    </div>
  )
}

export function QuoteDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/imagenes/Inmunoglobulina-IgG.png"
        alt=""
        width={400}
        height={400}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,28rem)] opacity-[0.035] dark:opacity-[0.05] select-none"
        unoptimized
      />
    </div>
  )
}

export function CtaDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/imagenes/Inmunoglobulina.png"
        alt=""
        width={360}
        height={360}
        className="absolute -right-16 top-1/2 -translate-y-1/2 w-48 sm:w-64 opacity-[0.05] dark:opacity-[0.07] select-none"
        unoptimized
      />
      <Image
        src="/sin%20fondo/Inmunoglobulina-IgG.png"
        alt=""
        width={200}
        height={200}
        className="absolute left-0 bottom-0 w-32 sm:w-40 opacity-[0.04] dark:opacity-[0.06] select-none"
        unoptimized
      />
    </div>
  )
}
