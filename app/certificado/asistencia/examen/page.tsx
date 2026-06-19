'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import AttendanceCertLayout from '@/components/AttendanceCertLayout'
import { AttendanceCertCard } from '@/components/AttendanceCertHeader'
import {
  AttendanceExamHeader,
  AttendanceExamProgress,
  AttendanceExamResult,
  AttendanceExamRules,
} from '@/components/AttendanceExamPanel'
import {
  fetchAttendanceExam,
  submitAttendanceExam,
  type AttendanceExam,
  type AttendanceExamSubmitResult,
} from '@/lib/attendance'
import {
  ATTENDANCE_EXAM_PASS_GRADE,
  ATTENDANCE_EXAM_TOTAL,
  formatAttendanceExamGrade,
} from '@/lib/attendance-exam'
import { saveAttendanceCertificate, setAttendanceSessionEmail } from '@/lib/attendance-session'

function ExamenContent() {
  const router = useRouter()
  const params = useSearchParams()
  const email = (params.get('email') ?? '').trim().toLowerCase()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [exam, setExam] = useState<AttendanceExam | null>(null)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [submitResult, setSubmitResult] = useState<AttendanceExamSubmitResult | null>(null)

  useEffect(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      router.replace('/certificado/asistencia')
      return
    }
    setAttendanceSessionEmail(email)
    setExam(null)
    setSelected({})
    setSubmitResult(null)
    setError('')
    let cancelled = false
    setLoading(true)
    fetchAttendanceExam(email)
      .then(data => { if (!cancelled) setExam(data) })
      .catch(err => { if (!cancelled) setError((err as Error)?.message ?? 'No se pudo cargar el examen') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [email, router])

  async function handleSubmit() {
    if (!exam || submitResult) return
    if (exam.questions.some(q => !selected[q.id])) {
      setError('Responde todas las preguntas antes de enviar')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const answers = exam.questions.map(q => ({ questionId: q.id, optionId: selected[q.id] }))
      const res = await submitAttendanceExam(email, answers)
      setSubmitResult(res)
      if (res.passed && res.certificate) {
        saveAttendanceCertificate(email, res.certificate, res.message, 'EXAM')
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al enviar el examen')
    } finally {
      setSubmitting(false)
    }
  }

  function handleRetry() {
    setSubmitResult(null)
    setSelected({})
    setError('')
  }

  if (!email) return null

  const questionCount = exam?.questions.length ?? ATTENDANCE_EXAM_TOTAL
  const finished = submitResult !== null
  const answeredCount = exam ? exam.questions.filter(q => selected[q.id]).length : 0

  return (
    <AttendanceCertLayout step="examen" email={email} xl>
      <AttendanceCertCard>
        <AttendanceExamHeader
          title={exam?.title ?? 'Examen de asistencia'}
          subtitle={
            exam
              ? `${questionCount} preguntas · Nota mínima ${formatAttendanceExamGrade(ATTENDANCE_EXAM_PASS_GRADE)}`
              : 'Cargando...'
          }
        />

        {!loading && exam && !finished && (
          <AttendanceExamProgress answered={answeredCount} total={questionCount} />
        )}

        <div className="px-6 sm:px-8 py-5 space-y-5 max-h-[min(58vh,640px)] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-[color:var(--scai-teal)] animate-spin" />
            </div>
          )}

          {!loading && !finished && <AttendanceExamRules />}

          {error && (
            <div className="flex items-start gap-3 bg-red-500/12 border border-red-500/25 rounded-xl px-4 py-3.5 text-red-300 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitResult && (
            <AttendanceExamResult
              result={submitResult}
              email={email}
              onRetry={handleRetry}
            />
          )}

          {!finished && exam?.questions.map((q, i) => {
            const answered = !!selected[q.id]
            return (
              <div
                key={q.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
                  answered
                    ? 'border-[rgba(18,180,198,0.35)] bg-[rgba(18,180,198,0.06)]'
                    : 'border-white/10 bg-[rgba(4,12,22,0.55)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: answered ? 'var(--scai-teal)' : 'rgba(255,255,255,0.08)',
                      color: answered ? '#fff' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-white leading-relaxed flex-1 pt-0.5">
                    {q.text}
                  </p>
                </div>
                <div className="mt-4 sm:mt-5 grid gap-2.5 sm:grid-cols-1">
                  {q.options.map((opt, oi) => {
                    const active = selected[q.id] === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelected(s => ({ ...s, [q.id]: opt.id }))}
                        className={`w-full flex items-start gap-3 text-left rounded-xl border px-4 py-3.5 text-sm sm:text-[15px] transition-all ${
                          active
                            ? 'border-[rgba(18,180,198,0.6)] bg-[rgba(18,180,198,0.14)] text-white shadow-[0_0_0_1px_rgba(18,180,198,0.2)]'
                            : 'border-white/10 bg-[rgba(4,12,22,0.45)] text-white/85 hover:border-white/25 hover:bg-[rgba(4,12,22,0.65)]'
                        }`}
                      >
                        <span
                          className="flex-shrink-0 mt-0.5 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={active
                            ? { background: 'var(--scai-teal)', color: '#fff' }
                            : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {!loading && exam && !finished && (
          <div
            className="px-6 sm:px-8 py-5 border-t border-white/8"
            style={{ background: 'rgba(4,12,22,0.4)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <p className="text-xs text-white/45 sm:flex-1 text-center sm:text-left">
                {answeredCount < questionCount
                  ? `Faltan ${questionCount - answeredCount} preguntas por responder`
                  : 'Todas las preguntas respondidas — listo para enviar'}
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || answeredCount < questionCount}
                className="w-full sm:w-auto sm:min-w-[200px] text-white font-semibold py-3.5 px-8 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
              >
                {submitting ? 'Enviando...' : 'Enviar examen'}
              </button>
            </div>
          </div>
        )}
      </AttendanceCertCard>
    </AttendanceCertLayout>
  )
}

function ExamenPageInner() {
  const params = useSearchParams()
  const email = (params.get('email') ?? '').trim().toLowerCase()
  return <ExamenContent key={email} />
}

export default function ExamenPage() {
  return (
    <Suspense fallback={null}>
      <ExamenPageInner />
    </Suspense>
  )
}
