'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import AttendanceCertLayout from '@/components/AttendanceCertLayout'
import AttendanceCertHeader, { AttendanceCertCard, AttendanceOptionButton } from '@/components/AttendanceCertHeader'
import {
  claimExamCertificate,
  claimViewingCertificate,
  fetchAttendanceStatus,
  type AttendanceClaimResult,
  type AttendanceStatusResult,
} from '@/lib/attendance'
import {
  clearAttendanceCertificate,
  loadAllAttendanceCertificates,
  saveAttendanceCertificate,
  setAttendanceSessionEmail,
} from '@/lib/attendance-session'
import {
  ATTENDANCE_EXAM_MAX_WRONG,
  ATTENDANCE_EXAM_PASS_GRADE,
  formatAttendanceExamGrade,
} from '@/lib/attendance-exam'

function OpcionesContent() {
  const router = useRouter()
  const params = useSearchParams()
  const email = (params.get('email') ?? '').trim().toLowerCase()

  const [statusLoading, setStatusLoading] = useState(true)
  const [claimLoading, setClaimLoading] = useState<'viewing' | 'exam' | null>(null)
  const [error, setError] = useState('')
  const [claimResult, setClaimResult] = useState<AttendanceClaimResult | null>(null)
  const [status, setStatus] = useState<AttendanceStatusResult | null>(null)

  useEffect(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      router.replace('/certificado/asistencia')
      return
    }
    setAttendanceSessionEmail(email)
    let cancelled = false
    setStatusLoading(true)
    setError('')
    fetchAttendanceStatus(email)
      .then(data => {
        if (cancelled) return
        setStatus(data)
        if (data.canOnlyTakeExam) {
          clearAttendanceCertificate(email, 'LIVE_VIEWING')
        }
        if (data.viewingCertificate) {
          saveAttendanceCertificate(email, data.viewingCertificate, 'Certificado por asistencia al evento en vivo.', 'LIVE_VIEWING')
        }
        if (data.examCertificate) {
          saveAttendanceCertificate(email, data.examCertificate, 'Certificado por examen de asistencia.', 'EXAM')
        }
      })
      .catch(err => {
        if (!cancelled) setError((err as Error)?.message ?? 'Error al consultar')
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false)
      })
    return () => { cancelled = true }
  }, [email, router])

  async function handleClaimViewing() {
    if (status?.canOnlyTakeExam) return
    setClaimLoading('viewing')
    setError('')
    setClaimResult(null)
    try {
      const data = await claimViewingCertificate(email)
      setClaimResult(data)
      if (data.certificate) {
        saveAttendanceCertificate(email, data.certificate, data.message, 'LIVE_VIEWING')
        router.push(`/certificado/asistencia/resultado?email=${encodeURIComponent(email)}&type=viewing`)
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al reclamar certificado')
    } finally {
      setClaimLoading(null)
    }
  }

  async function handleClaimExam() {
    setClaimLoading('exam')
    setError('')
    setClaimResult(null)
    try {
      const data = await claimExamCertificate(email)
      setClaimResult(data)
      if (data.certificate) {
        saveAttendanceCertificate(email, data.certificate, data.message, 'EXAM')
        router.push(`/certificado/asistencia/resultado?email=${encodeURIComponent(email)}&type=exam`)
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al reclamar certificado')
    } finally {
      setClaimLoading(null)
    }
  }

  function goResult(type: 'viewing' | 'exam') {
    router.push(`/certificado/asistencia/resultado?email=${encodeURIComponent(email)}&type=${type}`)
  }

  if (!email) return null

  const examenUrl = `/certificado/asistencia/examen?email=${encodeURIComponent(email)}`
  const canOnlyTakeExam = status?.canOnlyTakeExam === true
  const stored = loadAllAttendanceCertificates(email)
  const hasViewing = canOnlyTakeExam
    ? !!status?.viewingCertificate
    : !!(status?.viewingCertificate || stored.LIVE_VIEWING)
  const hasExam = !!(status?.examCertificate || stored.EXAM)
  const canClaimViewing = status?.canClaimViewing === true
  const canTakeExam = status?.canTakeExam === true
  const recipientName = status?.recipient?.fullName
  const examHint = `Nota mínima ${formatAttendanceExamGrade(ATTENDANCE_EXAM_PASS_GRADE)} · máx. ${ATTENDANCE_EXAM_MAX_WRONG} errores`

  return (
    <AttendanceCertLayout step="opciones" email={email} backHref="/certificado/asistencia" backLabel="Cambiar correo">
      <AttendanceCertCard>
        <AttendanceCertHeader
          email={email}
          name={recipientName}
          subtitle={
            canOnlyTakeExam
              ? 'Aprueba el examen para obtener tu certificado de asistencia'
              : 'Elige cómo obtener tu certificado de asistencia'
          }
        />

        <div className="px-6 py-5 space-y-3">
          {statusLoading && (
            <p className="text-xs text-white/50">Consultando tu estado...</p>
          )}

          {!statusLoading && canOnlyTakeExam && status?.status === 'OK' && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/35 bg-red-500/12 px-4 py-3">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-red-200">
                <p className="font-semibold text-red-100">No alcanzaste el 80% de visualización del evento en vivo.</p>
                <p className="mt-1">Solo puedes optar a 1 certificado, obtenido al aprobar el examen de asistencia.</p>
              </div>
            </div>
          )}

          {!statusLoading && (hasViewing || hasExam) && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-4 py-3 space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200 font-medium">Certificados emitidos</p>
              </div>
              {hasViewing && (
                <button
                  type="button"
                  onClick={() => goResult('viewing')}
                  className="block text-xs font-semibold hover:underline"
                  style={{ color: 'var(--scai-teal)' }}
                >
                  Ver certificado por asistencia al vivo →
                </button>
              )}
              {hasExam && (
                <button
                  type="button"
                  onClick={() => goResult('exam')}
                  className="block text-xs font-semibold hover:underline"
                  style={{ color: 'var(--scai-teal)' }}
                >
                  Ver certificado por examen →
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/12 border border-red-500/25 rounded-xl px-3.5 py-3 text-red-300 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {status?.status === 'NOT_FOUND' && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-xs text-red-200">
              {status.message ?? 'No encontramos tu correo en la lista de asistentes del evento.'}
            </div>
          )}

          {claimResult?.status === 'NOT_ELIGIBLE' && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-xs text-amber-200">
              {claimResult.message}
            </div>
          )}

          {!statusLoading && status?.status === 'OK' && (
            <>
              {!canOnlyTakeExam && (
                canClaimViewing ? (
                  <AttendanceOptionButton
                    variant="primary"
                    title="Certificado por asistencia al vivo"
                    description="Viste más del 80% del evento en vivo."
                    onClick={handleClaimViewing}
                    loading={claimLoading === 'viewing'}
                  />
                ) : hasViewing ? (
                  <AttendanceOptionButton
                    variant="primary"
                    title="Certificado por asistencia al vivo"
                    description="Ya emitido. Ver y descargar."
                    onClick={() => goResult('viewing')}
                  />
                ) : (
                  <AttendanceOptionButton
                    variant="primary"
                    title="Certificado por asistencia al vivo"
                    description="No alcanzaste el 80% de visualización del evento."
                    disabled
                  />
                )
              )}

              {canTakeExam ? (
                <AttendanceOptionButton
                  variant={canOnlyTakeExam ? 'primary' : 'secondary'}
                  title="Realizar examen"
                  description={
                    canOnlyTakeExam
                      ? `Aprueba el test para obtener tu certificado. ${examHint}.`
                      : `Aprueba el test para tu certificado por examen. ${examHint}.`
                  }
                  href={examenUrl}
                />
              ) : hasExam ? (
                <AttendanceOptionButton
                  variant="secondary"
                  title="Certificado por examen"
                  description="Ya emitido. Ver y descargar."
                  onClick={() => goResult('exam')}
                />
              ) : (
                <AttendanceOptionButton
                  variant="secondary"
                  title="Reclamar certificado de examen"
                  description="Aprobaste el examen. Reclámalo aquí para descargarlo."
                  onClick={handleClaimExam}
                  loading={claimLoading === 'exam'}
                />
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/8">
          <p className="text-[10px] text-white/40 text-center leading-relaxed">
            {canOnlyTakeExam
              ? 'Tu certificado está disponible únicamente por examen de asistencia.'
              : 'Quien vio más del 80% puede obtener ambos certificados.'}
          </p>
        </div>
      </AttendanceCertCard>
    </AttendanceCertLayout>
  )
}

export default function OpcionesPage() {
  return (
    <Suspense fallback={null}>
      <OpcionesContent />
    </Suspense>
  )
}
