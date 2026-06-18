'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { AttendanceCertificateData } from '@/lib/attendance'
import { ATTENDANCE_VERIFY_PATH } from '@/lib/attendance'
import {
  ATTENDANCE_CERT_ASPECT,
  CERT_BG,
  CERT_LAYOUT,
  certNameFontPercent,
  certNameTopPercent,
  certQrBottomPercent,
  certQrRightPercent,
  certQrSizePercent,
  getCertificateTemplatePdf,
} from '@/lib/attendance-certificate-layout'

type Props = {
  data: AttendanceCertificateData
  verifyBasePath?: string
}

const AttendanceCertificateCard = forwardRef<HTMLDivElement, Props>(function AttendanceCertificateCard(
  { data, verifyBasePath = ATTENDANCE_VERIFY_PATH },
  ref,
) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const verifyUrl = data.certificateCode ? `${origin}${verifyBasePath}/${data.certificateCode}` : null
  const templateUrl = getCertificateTemplatePdf(data)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  const nameTop = certNameTopPercent()
  const nameFont = certNameFontPercent()
  const qrRight = certQrRightPercent()
  const qrBottom = certQrBottomPercent()
  const qrSize = certQrSizePercent()

  useEffect(() => {
    let cancelled = false
    setReady(false)
    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
        const pdf = await pdfjs.getDocument({ url: templateUrl }).promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = canvasRef.current
        if (!canvas || cancelled) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvas, canvasContext: ctx, viewport }).promise
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) setReady(false)
      }
    })()
    return () => { cancelled = true }
  }, [templateUrl])

  return (
    <div
      ref={ref}
      className="cert-wrapper"
      style={{
        width: '100%',
        maxWidth: '810px',
        aspectRatio: String(ATTENDANCE_CERT_ASPECT),
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 48px rgba(0,0,0,0.2)',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        background: CERT_BG,
        containerType: 'inline-size',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          opacity: ready ? 1 : 0,
        }}
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500" style={{ background: CERT_BG }}>
          Cargando certificado...
        </div>
      )}

      <p
        style={{
          position: 'absolute',
          top: `${nameTop}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          width: `${(CERT_LAYOUT.nameMaxWidth / 810) * 100}%`,
          textAlign: 'center',
          color: '#111827',
          fontWeight: 700,
          fontSize: `${nameFont}cqw`,
          lineHeight: 1.1,
          wordBreak: 'break-word',
          zIndex: 2,
        }}
      >
        {data.recipient.fullName}
      </p>

      {verifyUrl && (
        <div
          style={{
            position: 'absolute',
            right: `${qrRight}%`,
            bottom: `${qrBottom}%`,
            width: `${qrSize}%`,
            zIndex: 2,
          }}
        >
          <QRCodeSVG
            value={verifyUrl}
            size={512}
            bgColor="#ffffff"
            fgColor="#1e3a5f"
            level="M"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <p
            style={{
              marginTop: '2px',
              fontSize: 'clamp(5px, 0.68cqw, 8px)',
              fontFamily: 'monospace',
              color: '#64748b',
              textAlign: 'center',
              wordBreak: 'break-all',
              lineHeight: 1.2,
            }}
          >
            {data.certificateCode}
          </p>
        </div>
      )}
    </div>
  )
})

export default AttendanceCertificateCard
