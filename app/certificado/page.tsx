'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { useRequireAuth } from '@/lib/useRequireAuth'
import {
  fetchMyCertificates,
  fetchPublishedExam,
  issueCertificate,
  verifyCertificate,
  type Certificate,
  type CertVerifyResult,
} from '@/lib/exams'

export default function CertificadoPage() {
  const { firebaseUser, profile, loading: authLoading, ready } = useRequireAuth()
  const [cert, setCert] = useState<Certificate | null>(null)
  const [verify, setVerify] = useState<CertVerifyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const certRef = useRef<HTMLDivElement | null>(null)

  const displayName = useMemo(() => {
    const fromVerify = verify?.user ? `${verify.user.firstName} ${verify.user.lastName}`.trim() : ''
    if (fromVerify) return fromVerify
    if (profile) return `${profile.firstName} ${profile.lastName}`.trim()
    return firebaseUser?.email ?? 'Profesional acreditado'
  }, [firebaseUser?.email, profile, verify?.user])

  const displayEmail = useMemo(() => {
    return verify?.user?.email ?? profile?.email ?? firebaseUser?.email ?? ''
  }, [firebaseUser?.email, profile?.email, verify?.user?.email])

  useEffect(() => {
    if (!ready) return

    let cancelled = false
    setLoading(true)
    ;(async () => {
      let list = await fetchMyCertificates()
      let latest = list?.[0] ?? null

      if (!latest) {
        const exam = await fetchPublishedExam().catch(() => null)
        if (exam && (exam.passed || exam.canTakeExam === false || exam.certificate)) {
          latest = exam.certificate ?? (await issueCertificate(exam.id).catch(() => null))
          if (!latest) {
            list = await fetchMyCertificates()
            latest = list?.[0] ?? null
          }
        }
      }

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
  }, [authLoading, firebaseUser])

  const issuedAt = verify?.issuedAt ?? cert?.issuedAt
  const issuedDate = issuedAt
    ? new Date(issuedAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.scairegionales.cl'
  const code = cert?.certificateCode ?? verify?.certificateCode
  const verifyUrl = code
    ? `${origin}/certificado/verificar/${code}`
    : null

  const examTitle = verify?.exam?.title ?? cert?.exam?.title ?? 'Test de Inmunología Clínica'

  async function downloadPdf() {
    if (downloading) return
    const node = certRef.current
    if (!node) return

    setDownloading(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(node, {
        scale: Math.max(2, Math.ceil(window.devicePixelRatio || 2)),
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()

      const imgW = pageW
      const imgH = (canvas.height * imgW) / canvas.width
      const y = Math.max(0, (pageH - imgH) / 2)

      pdf.addImage(imgData, 'JPEG', 0, y, imgW, imgH, undefined, 'FAST')

      const safeName = (displayName || 'certificado')
        .replace(/[\\/:*?"<>|]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      const file = `certificado-${safeName}${code ? `-${code}` : ''}.pdf`
      pdf.save(file)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { margin: 0; }
          .no-print { display: none !important; }
          .cert-wrapper { box-shadow: none !important; }
        }
      `}</style>

      <div className="no-print p-4 flex items-center justify-center" style={{ background: '#F3F4F6' }}>
        <button
          onClick={downloadPdf}
          disabled={loading || downloading}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: '#12B4C6' }}
        >
          {downloading ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
      </div>

      <div className="flex items-center justify-center pb-10 print:p-0" style={{ background: '#F3F4F6' }}>
        <div
          ref={certRef}
          className="cert-wrapper bg-white relative overflow-hidden"
          style={{
            width: '297mm',
            minHeight: '210mm',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            fontFamily: "'Georgia', serif",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              border: '18px solid transparent',
              borderImage: 'linear-gradient(135deg, #12B4C6 0%, #0a8a97 50%, #12B4C6 100%) 1',
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{ background: 'linear-gradient(90deg, #12B4C6 0%, #0a8a97 100%)' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-2"
            style={{ background: 'linear-gradient(90deg, #0a8a97 0%, #12B4C6 100%)' }}
          />

          <div className="relative z-10 flex flex-col h-full px-16 py-10" style={{ minHeight: '210mm' }}>
            <div className="flex items-start justify-between mb-6">
              <Image
                src={ScaiLogo}
                alt="SCAI"
                className="h-12 w-auto"
                style={{ filter: 'brightness(0)' }}
              />
              <div className="text-right">
                <p
                  className="text-xs uppercase tracking-[0.2em] font-semibold"
                  style={{ color: '#12B4C6' }}
                >
                  Sociedad Chilena de Alergia e Inmunología
                </p>
                <p className="text-xs mt-0.5 tracking-widest uppercase" style={{ color: '#9CA3AF' }}>www.scai.cl</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              <p
                className="text-xs uppercase tracking-[0.35em] font-semibold mb-4"
                style={{ color: '#12B4C6' }}
              >
                Certificado de Aprobación
              </p>

              <div
                className="w-16 h-px mb-6"
                style={{ background: 'linear-gradient(90deg, transparent, #12B4C6, transparent)' }}
              />

              <p className="text-sm mb-2 tracking-wide" style={{ color: '#6B7280' }}>Se certifica que</p>

              <p
                className="font-black mb-3 leading-tight"
                style={{ fontSize: '2.6rem', color: '#0B1928', fontFamily: "'Georgia', serif" }}
              >
                {loading ? '...' : displayName}
              </p>

              {!!displayEmail && (
                <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>{displayEmail}</p>
              )}

              <p className="text-sm mb-1 tracking-wide" style={{ color: '#6B7280' }}>ha aprobado satisfactoriamente</p>
              <p
                className="font-bold text-lg mb-1"
                style={{ color: '#0B1928' }}
              >
                III Jornadas Regionales de Inmunología Clínica
              </p>
              <p className="text-sm italic mb-2" style={{ color: '#6B7280' }}>
                Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad
              </p>
              {examTitle && (
                <p className="text-xs mb-6" style={{ color: '#9CA3AF' }}>Examen: {examTitle}</p>
              )}

              <div
                className="w-16 h-px mb-6"
                style={{ background: 'linear-gradient(90deg, transparent, #12B4C6, transparent)' }}
              />

              <div className="flex items-end justify-center gap-16">
                <div className="text-center">
                  <div className="w-36 h-px mb-1.5" style={{ background: '#D1D5DB' }} />
                  <p className="text-xs" style={{ color: '#6B7280' }}>Directiva SCAI</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1" style={{ color: '#374151' }}>{loading ? '...' : issuedDate}</p>
                  <div className="w-36 h-px mb-1.5" style={{ background: '#D1D5DB' }} />
                  <p className="text-xs" style={{ color: '#6B7280' }}>Fecha de emisión</p>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between mt-4 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
              <div>
                <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#D1D5DB' }}>Código de verificación</p>
                <p className="text-[10px] font-mono" style={{ color: '#6B7280' }}>
                  {loading ? '...' : (code ?? '—')}
                </p>
              </div>
              {verifyUrl && !loading && (
                <div className="flex flex-col items-center gap-1">
                  <QRCodeSVG
                    value={verifyUrl}
                    size={72}
                    bgColor="#ffffff"
                    fgColor="#0B1928"
                    level="M"
                  />
                  <p className="text-[8px] uppercase tracking-widest" style={{ color: '#D1D5DB' }}>Verificar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
