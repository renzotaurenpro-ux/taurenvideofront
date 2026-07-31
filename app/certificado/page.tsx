'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Download, ArrowLeft } from 'lucide-react'
import { useRequireAuth } from '@/lib/useRequireAuth'
import {
  resolveCourseExamAccess,
  verifyCertificate,
  type Certificate,
  type CertVerifyResult,
} from '@/lib/exams'
import { buildCourseAttendanceCertificate } from '@/lib/course-certificate'
import type { AttendanceCertificateData } from '@/lib/attendance'
import AttendanceCertificateCard from '@/components/AttendanceCertificateCard'
import { downloadAttendanceCertificatePdf } from '@/lib/attendance-certificate-pdf'
import PageBackground from '@/components/PageBackground'

export default function CertificadoPage() {
  const { firebaseUser, profile, loading: authLoading, ready } = useRequireAuth()
  const [cert, setCert] = useState<Certificate | null>(null)
  const [verify, setVerify] = useState<CertVerifyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const certRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ready) return

    let cancelled = false
    setLoading(true)
    ;(async () => {
      const access = await resolveCourseExamAccess().catch(() => null)
      const latest: Certificate | null = access?.certificate ?? null

      if (!cancelled) setCert(latest)

      const code = latest?.certificateCode
      if (code) {
        const verified = await verifyCertificate(code).catch(() => null)
        if (!cancelled) setVerify(verified)
      } else if (!cancelled) {
        setVerify(null)
      }

      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [authLoading, firebaseUser, ready])

  const certificate: AttendanceCertificateData | null = useMemo(() => {
    if (!cert) return null
    return buildCourseAttendanceCertificate({
      cert,
      verify,
      profile,
      emailFallback: firebaseUser?.email ?? undefined,
    })
  }, [cert, verify, profile, firebaseUser?.email])

  async function downloadPdf() {
    if (downloading || !certificate) return
    setDownloading(true)
    try {
      await downloadAttendanceCertificatePdf(certificate, window.location.origin)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="relative min-h-[100dvh] min-h-screen w-full">
      <PageBackground scene="login" />
      <div className="relative z-10 mx-auto max-w-[840px] px-4 sm:px-6 pt-[max(4.5rem,calc(env(safe-area-inset-top,0px)+3.5rem))] pb-10">
        <Link
          href="/ver"
          className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white/85 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al video
        </Link>

        <div className="max-w-lg mx-auto space-y-2">
          {loading ? (
            <div className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/60">
              Cargando certificado...
            </div>
          ) : !certificate ? (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 space-y-3">
              <p className="text-sm text-red-300">
                No encontramos un certificado emitido para tu cuenta.
              </p>
              <Link
                href="/ver/test"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                style={{ background: 'var(--scai-teal)' }}
              >
                Ir al examen
              </Link>
            </div>
          ) : (
            <>
              <div
                className="rounded-2xl border border-[rgba(18,180,198,0.35)] px-4 py-3 flex items-start gap-2.5"
                style={{ background: 'rgba(18,180,198,0.1)' }}
              >
                <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">Certificado de Aprobación</p>
                  <p className="text-xs text-white/70 mt-0.5">
                    {certificate.recipient.fullName}
                  </p>
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
            </>
          )}
        </div>

        {certificate && (
          <div className="mt-4 w-full">
            <AttendanceCertificateCard ref={certRef} data={certificate} />
          </div>
        )}
      </div>
    </div>
  )
}
