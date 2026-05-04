'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'

export default function CertificadoPage() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 200)
    return () => clearTimeout(t)
  }, [])

  return (
    <main className="min-h-screen bg-white text-black p-6 sm:p-10">
      <div className="mx-auto max-w-3xl border p-8 sm:p-12">
        <div className="flex items-center justify-between gap-6">
          <Image src={ScaiLogo} alt="SCAI" className="h-10 w-auto" style={{ filter: 'invert(1) brightness(0)' }} />
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest">Certificado</p>
            <p className="text-sm font-semibold">III Jornadas Regionales de Inmunología Clínica</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm">Se certifica que</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black">Profesional acreditado</p>
          <p className="mt-4 text-sm leading-relaxed">
            Ha aprobado la evaluación y cuenta con acceso completo a la grabación del evento.
          </p>
        </div>

        <div className="mt-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs">Fecha</p>
            <p className="text-sm font-semibold">{new Date().toLocaleDateString('es-CL')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs">Organiza</p>
            <p className="text-sm font-semibold">Sociedad Chilena de Alergia e Inmunología</p>
          </div>
        </div>

        <div className="mt-8 text-center print:hidden">
          <Link href="/ver" className="text-sm underline">Volver</Link>
        </div>
      </div>
    </main>
  )
}

