'use client'

import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { AttendanceCertificateData } from '@/lib/attendance'
import { ATTENDANCE_VERIFY_PATH } from '@/lib/attendance'
import {
  ATTENDANCE_CERT_ASPECT,
  CERT_BG,
  getCertificateOverlayContent,
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
  const { heading, bodyText, replaceBody } = getCertificateOverlayContent(data)

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
        background: CERT_BG,
      }}
    >
      <img
        src="/certificados/plantilla-asistencia-3x.png"
        alt={heading}
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

      <div
        style={{
          position: 'absolute',
          top: '23.5%',
          left: '5%',
          width: '90%',
          height: '13.5%',
          background: CERT_BG,
          zIndex: 1,
        }}
      />

      <p
        style={{
          position: 'absolute',
          top: '27.5%',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: 0,
          width: '88%',
          textAlign: 'center',
          color: '#4b5563',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(10px, 1.65vw, 13px)',
          lineHeight: 1.2,
          zIndex: 2,
        }}
      >
        Otorga el presente
      </p>

      <p
        style={{
          position: 'absolute',
          top: '31.2%',
          left: '50%',
          transform: 'translateX(-50%)',
          margin: 0,
          padding: '0 4%',
          width: '92%',
          textAlign: 'center',
          color: '#111827',
          fontWeight: 700,
          fontSize: 'clamp(12px, 2.35vw, 20px)',
          letterSpacing: '0.025em',
          lineHeight: 1.15,
          zIndex: 2,
        }}
      >
        {heading}
      </p>

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

      {replaceBody && bodyText && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '50.2%',
              left: '7%',
              width: '86%',
              height: '16%',
              background: CERT_BG,
              zIndex: 1,
            }}
          />
          <p
            style={{
              position: 'absolute',
              top: '50.8%',
              left: '50%',
              transform: 'translateX(-50%)',
              margin: 0,
              padding: '0 8%',
              width: '84%',
              textAlign: 'center',
              color: '#1f2937',
              fontWeight: 400,
              fontSize: 'clamp(9px, 1.42vw, 12px)',
              lineHeight: 1.45,
              zIndex: 2,
            }}
          >
            {bodyText}
          </p>
        </>
      )}

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
          <QRCodeSVG value={verifyUrl} size={54} bgColor={CERT_BG} fgColor="#1e3a5f" level="M" />
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
