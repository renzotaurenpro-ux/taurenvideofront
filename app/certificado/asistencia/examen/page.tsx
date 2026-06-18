'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import AttendanceCertLayout from '@/components/AttendanceCertLayout'
import { AttendanceCertCard } from '@/components/AttendanceCertHeader'
import {
  fetchAttendanceExam,
  submitAttendanceExam,
  type AttendanceExam,
  type AttendanceExamSubmitResult,
} from '@/lib/attendance'
import { saveAttendanceCertificate } from '@/lib/attendance-session'

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
    let cancelled = false
    setLoading(true)
    fetchAttendanceExam(email)
      .then(data => { if (!cancelled) setExam(data) })
      .catch(err => { if (!cancelled) setError((err as Error)?.message ?? 'No se pudo cargar el examen') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [email, router])

  async function handleSubmit() {
    if (!exam) return
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
        router.push(`/certificado/asistencia/resultado?email=${encodeURIComponent(email)}&type=exam`)
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al enviar el examen')
    } finally {
      setSubmitting(false)
    }
  }

  if (!email) return null

  return (
    <AttendanceCertLayout step="examen" email={email}>
      <AttendanceCertCard>
        <div className="px-6 pt-5 pb-2">
          <h1 className="text-lg font-bold text-white">{exam?.title ?? 'Examen de asistencia'}</h1>
          <p className="text-white/50 text-xs mt-1">
            {exam ? `${exam.questions.length} preguntas · Nota mínima 5.0` : 'Cargando...'}
          </p>
        </div>

        <div className="px-6 pb-6 space-y-4 max-h-[55vh] overflow-y-auto">
          {loading && <p className="text-sm text-white/50">Cargando examen...</p>}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/12 border border-red-500/25 rounded-xl px-3.5 py-3 text-red-300 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {submitResult && !submitResult.passed && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-xs text-amber-200">
              {submitResult.message}
              {typeof submitResult.nota === 'number' && (
                <span className="block mt-1 text-white/60">Nota: {submitResult.nota}/{submitResult.notaMaxima ?? 7}</span>
              )}
            </div>
          )}
          {exam?.questions.map((q, i) => (
            <div key={q.id} className="rounded-xl border border-white/10 bg-[rgba(4,12,22,0.6)] p-4">
              <p className="text-sm font-semibold text-white leading-snug">{i + 1}. {q.text}</p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const active = selected[q.id] === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelected(s => ({ ...s, [q.id]: opt.id }))}
                      className={`w-full flex items-start gap-2.5 text-left rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? 'border-[rgba(18,180,198,0.55)] bg-[rgba(18,180,198,0.12)] text-white'
                          : 'border-white/10 bg-[rgba(4,12,22,0.5)] text-white/80 hover:border-white/20'
                      }`}
                    >
                      <span
                        className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={active
                          ? { background: 'var(--scai-teal)', color: '#fff' }
                          : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {!loading && exam && (
          <div className="px-6 py-5 border-t border-white/8 space-y-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-50"
              style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
            >
              {submitting ? 'Enviando...' : 'Enviar examen'}
            </button>
          </div>
        )}
      </AttendanceCertCard>
    </AttendanceCertLayout>
  )
}

export default function ExamenPage() {
  return (
    <Suspense fallback={null}>
      <ExamenContent />
    </Suspense>
  )
}
