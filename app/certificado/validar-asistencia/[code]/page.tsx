'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { CheckCircle, XCircle, Home } from 'lucide-react'
import ScaiLogo from '../../../../Logotipo-SCAI.png'
import { verifyAttendanceCertificate, type AttendanceVerifyResult } from '@/lib/attendance'

export default function ValidarAsistenciaPage() {
  const { code } = useParams<{ code: string }>()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AttendanceVerifyResult | null>(null)

  useEffect(() => {
    if (!code) { setLoading(false); return }
    verifyAttendanceCertificate(code as string)
      .then(r => setData(r))
      .catch(() => setData({ valid: false, type: 'ATTENDANCE' }))
      .finally(() => setLoading(false))
  }, [code])

  return (
    <main className="min-h-screen bg-[#0B1928] text-white p-6 sm:p-10 flex items-center justify-center">
      <Link
        href="/"
        className="fixed top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/80 hover:text-white border border-white/15 bg-[rgba(8,18,32,0.75)] backdrop-blur-md"
      >
        <Home size={14} style={{ color: 'var(--scai-teal)' }} />
        Inicio
      </Link>

      <div
        className="w-full max-w-lg rounded-2xl border border-white/12 p-8 sm:p-10 space-y-6"
        style={{ background: 'rgba(8,18,32,0.92)' }}
      >
        <div className="flex items-center justify-between gap-4">
          <Image src={ScaiLogo} alt="SCAI" className="h-8 w-auto" />
          <p className="text-[10px] uppercase tracking-widest text-white/40 text-right">Validación de asistencia</p>
        </div>

        {loading ? (
          <div className="text-sm text-white/50">Verificando certificado...</div>
        ) : !data?.valid ? (
          <div>
            <div className="flex items-center gap-3 text-red-400">
              <XCircle size={28} />
              <p className="font-semibold">Certificado no válido</p>
            </div>
            <p className="text-sm text-white/50 mt-3">El código no corresponde a un certificado de asistencia emitido.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle size={28} />
              <div>
                <p className="font-semibold">Certificado de asistencia válido</p>
                <p className="text-sm text-white/50 mt-0.5">Código: {data.certificateCode}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm border-t border-white/10 pt-6">
              <p><span className="text-white/45">Nombre:</span> {data.recipient?.fullName}</p>
              <p><span className="text-white/45">Correo:</span> {data.recipient?.email}</p>
              <p><span className="text-white/45">Evento:</span> {data.event?.eventTitle}</p>
              {data.event?.eventSubtitle && (
                <p className="text-white/55 text-xs italic">{data.event.eventSubtitle}</p>
              )}
              {data.issuedAt && (
                <p>
                  <span className="text-white/45">Emitido:</span>{' '}
                  {new Date(data.issuedAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        )}

        <Link href="/certificado/asistencia" className="inline-block text-sm font-medium" style={{ color: 'var(--scai-teal)' }}>
          Obtener certificado de asistencia
        </Link>
      </div>
    </main>
  )
}
