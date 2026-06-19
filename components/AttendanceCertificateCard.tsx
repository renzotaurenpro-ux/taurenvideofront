'use client'

import { forwardRef, useEffect, useState } from 'react'
import type { AttendanceCertificateData } from '@/lib/attendance'
import {
  ATTENDANCE_CERT_ASPECT,
  createAttendanceCertificatePreviewUrl,
} from '@/lib/attendance-certificate-pdf'

type Props = {
  data: AttendanceCertificateData
}

const AttendanceCertificateCard = forwardRef<HTMLDivElement, Props>(function AttendanceCertificateCard(
  { data },
  ref,
) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    setPreviewUrl(null)
    setError(false)
    const origin = window.location.origin
    createAttendanceCertificatePreviewUrl(data, origin)
      .then(url => {
        if (cancelled) {
          URL.revokeObjectURL(url)
          return
        }
        objectUrl = url
        setPreviewUrl(url)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [data])

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
        background: '#eef1f5',
      }}
    >
      {!previewUrl && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
          Cargando certificado...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400">
          No se pudo cargar la vista previa
        </div>
      )}
      {previewUrl && (
        <iframe
          src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          title="Certificado"
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  )
})

export default AttendanceCertificateCard
