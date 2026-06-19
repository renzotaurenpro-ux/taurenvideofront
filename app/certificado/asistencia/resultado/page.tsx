'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Download, LayoutGrid } from 'lucide-react'
import AttendanceCertLayout from '@/components/AttendanceCertLayout'
import AttendanceCertificateCard from '@/components/AttendanceCertificateCard'
import { downloadAttendanceCertificatePdf } from '@/lib/attendance-certificate-pdf'
import { loadAttendanceCertificate, resetAttendanceSession, setAttendanceSessionEmail } from '@/lib/attendance-session'
import type { AttendanceCertificateData, AttendanceCertificateType } from '@/lib/attendance'
import { resolveCertificateTitle } from '@/lib/attendance'

function resolveCertType(raw: string | null): AttendanceCertificateType {
  return raw === 'exam' ? 'EXAM' : 'LIVE_VIEWING'
}

function ResultadoContent() {
  const router = useRouter()
  const params = useSearchParams()
  const email = (params.get('email') ?? '').trim().toLowerCase()
  const certType = resolveCertType(params.get('type'))
  const certRef = useRef<HTMLDivElement | null>(null)

  const [message, setMessage] = useState('')
  const [certificate, setCertificate] = useState<AttendanceCertificateData | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!email) {
      router.replace('/certificado/asistencia')
      return
    }
    setAttendanceSessionEmail(email)
    const saved = loadAttendanceCertificate(email, certType)
    if (!saved?.certificate || saved.certificate.recipient.email.toLowerCase() !== email) {
      router.replace(`/certificado/asistencia/opciones?email=${encodeURIComponent(email)}`)
      return
    }
    setCertificate(saved.certificate)
    setMessage(saved.message)
  }, [email, certType, router])

  async function downloadPdf() {
    if (downloading || !certificate) return
    setDownloading(true)
    try {
      await downloadAttendanceCertificatePdf(certificate, window.location.origin)
    } finally {
      setDownloading(false)
    }
  }

  function handleReset() {
    resetAttendanceSession()
    router.push('/certificado/asistencia')
  }

  if (!certificate) return null

  const menuUrl = `/certificado/asistencia/opciones?email=${encodeURIComponent(email)}`
  const otherType = certType === 'LIVE_VIEWING' ? 'exam' : 'viewing'
  const otherSaved = loadAttendanceCertificate(email, certType === 'LIVE_VIEWING' ? 'EXAM' : 'LIVE_VIEWING')
  const title = resolveCertificateTitle(certificate)

  return (
    <AttendanceCertLayout step="resultado" email={email} wide>
      <div className="max-w-lg mx-auto space-y-2">
        <div
          className="rounded-2xl border border-[rgba(18,180,198,0.35)] px-4 py-3 flex items-start gap-2.5"
          style={{ background: 'rgba(18,180,198,0.1)' }}
        >
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs text-white/70 mt-0.5">{message}</p>
            <p className="text-xs text-white/55 mt-0.5">Tu certificado está listo para descargar.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadPdf}
          disabled={downloading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
        >
          <Download size={16} />
          {downloading ? 'Generando PDF...' : 'Descargar certificado PDF'}
        </button>

        {otherSaved?.certificate && (
          <Link
            href={`/certificado/asistencia/resultado?email=${encodeURIComponent(email)}&type=${otherType}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white border border-white/15"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            Ver el otro certificado
          </Link>
        )}

        <Link
          href={menuUrl}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white border border-[rgba(18,180,198,0.45)]"
          style={{ background: 'rgba(18,180,198,0.12)' }}
        >
          <LayoutGrid size={16} />
          Volver al menú de opciones
        </Link>

        <button
          type="button"
          onClick={handleReset}
          className="w-full text-center text-xs text-white/45 hover:text-white/70 py-1 transition-colors"
        >
          Consultar otro correo
        </button>
      </div>

      <div className="mt-4 w-full">
        <AttendanceCertificateCard ref={certRef} data={certificate} />
      </div>
    </AttendanceCertLayout>
  )
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={null}>
      <ResultadoContent />
    </Suspense>
  )
}
