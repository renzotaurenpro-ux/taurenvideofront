'use client'

import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { AttendanceCertificateData } from '@/lib/attendance'
import { ATTENDANCE_VERIFY_PATH } from '@/lib/attendance'
import { ATTENDANCE_CERT_ASPECT } from '@/lib/attendance-certificate-pdf'

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
        fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
        background: '#e8eef5',
      }}
    >
      <img
        src="/certificados/plantilla-asistencia-3x.png"
        alt="Certificado de asistencia"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          display: 'block',
        }}
      />

      <p
        style={{
          position: 'absolute',
          top: '46.5%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          padding: '0 6%',
          width: '88%',
          textAlign: 'center',
          color: '#111827',
          fontWeight: 700,
          fontSize: 'clamp(18px, 3.7vw, 30px)',
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
            right: '4.7%',
            bottom: '4.8%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            zIndex: 2,
          }}
        >
          <QRCodeSVG value={verifyUrl} size={54} bgColor="#e8eef5" fgColor="#1e3a5f" level="M" />
          <p
            style={{
              fontSize: 'clamp(6px, 1vw, 8px)',
              fontFamily: 'monospace',
              color: '#64748b',
              margin: 0,
              letterSpacing: '0.02em',
              maxWidth: '54px',
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
