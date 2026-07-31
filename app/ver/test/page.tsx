'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, Download, Trophy } from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { setCertPassedLocal } from '@/lib/certTest'
import {
  issueCertificate,
  resolveCourseExamAccess,
  submitExam,
  type Certificate,
  type Exam,
  type ExamSubmitResult,
} from '@/lib/exams'
import { fetchPublishedCourse, checkCoursePurchase } from '@/lib/courses'
import { getCachedPurchase, setCachedPurchase } from '@/lib/api'
import PageBackground from '@/components/PageBackground'
import { AttendanceCertCard } from '@/components/AttendanceCertHeader'
import {
  AttendanceExamHeader,
  AttendanceExamProgress,
} from '@/components/AttendanceExamPanel'

export default function VerTestPage() {
  const router = useRouter()
  const { firebaseUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState<Exam | null>(null)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ExamSubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [purchased, setPurchased] = useState(false)
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!firebaseUser) router.replace('/login')
  }, [authLoading, firebaseUser, router])

  useEffect(() => {
    if (authLoading) return
    if (!firebaseUser) return

    let cancelled = false
    setLoading(true)
    setError('')
    setResult(null)

    ;(async () => {
      try {
        const course = await fetchPublishedCourse()

        if (course?.id) {
          const cached = getCachedPurchase(course.id)
          let hasPurchase: boolean

          if (cached !== null) {
            hasPurchase = cached
            checkCoursePurchase(course.id)
              .then(v => setCachedPurchase(course.id, v))
              .catch(() => {})
          } else {
            hasPurchase = await checkCoursePurchase(course.id)
            setCachedPurchase(course.id, hasPurchase)
          }

          if (!cancelled) setPurchased(hasPurchase)
          if (!hasPurchase) {
            if (!cancelled) setLoading(false)
            return
          }
        }

        const access = await resolveCourseExamAccess()
        if (!cancelled) {
          setExam(access.exam)
          setCertificate(access.certificate)
          setSelected({})
          if (access.passed || access.certificate) {
            setPassed(true)
            setCertPassedLocal(true)
            setResult({
              passed: true,
              canTakeExam: false,
              certificate: access.certificate,
              score: access.exam?.lastAttempt?.score,
            })
          } else if (!access.exam) {
            setError('No se pudo cargar el examen. Revisa que esté publicado en el servidor.')
          } else {
            setPassed(false)
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Error al cargar examen')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [authLoading, firebaseUser])

  if (authLoading || !firebaseUser) {
    return (
      <div className="relative min-h-screen w-full">
        <PageBackground scene="login" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-[color:var(--scai-teal)] animate-spin" />
        </div>
      </div>
    )
  }

  const canTake = !passed && exam?.canTakeExam === true && (exam.questions?.length ?? 0) > 0
  const questionsCount = exam?.questions?.length ?? 0
  const answeredCount = exam ? exam.questions.filter(q => selected[q.id]).length : 0
  const activeCert = result?.certificate ?? certificate ?? exam?.certificate
  const title = exam?.title ?? exam?.name ?? activeCert?.exam?.title ?? 'Examen del curso'
  const failed = !!result && !result.passed && !passed

  return (
    <div className="relative min-h-[100dvh] min-h-screen w-full">
      <PageBackground scene="login" />
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pt-[max(4.5rem,calc(env(safe-area-inset-top,0px)+3.5rem))] pb-10">
        <Link
          href="/ver"
          className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white/85 mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al video
        </Link>

        {!purchased && !loading ? (
          <AttendanceCertCard>
            <div className="px-6 sm:px-8 py-8 space-y-4">
              <p className="text-sm text-white/70 leading-relaxed">
                Debes adquirir el acceso al video para realizar el test y obtener tu certificado.
              </p>
              <Link
                href="/carrito"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
              >
                Obtener acceso
              </Link>
            </div>
          </AttendanceCertCard>
        ) : (
          <AttendanceCertCard>
            <AttendanceExamHeader
              title={title}
              subtitle={
                passed
                  ? 'Ya aprobaste este examen · certificado disponible'
                  : canTake
                    ? `${questionsCount} preguntas · Responde todas para validar`
                    : loading
                      ? 'Cargando...'
                      : 'Estado del examen'
              }
            />

            {canTake && !loading && (
              <AttendanceExamProgress answered={answeredCount} total={questionsCount} />
            )}

            <div className="px-6 sm:px-8 py-5 space-y-5 max-h-[min(58vh,640px)] overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-[color:var(--scai-teal)] animate-spin" />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 bg-red-500/12 border border-red-500/25 rounded-xl px-4 py-3.5 text-red-300 text-sm">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div className="space-y-3">
                    <span>{error}</span>
                    <Link
                      href="/certificado"
                      className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white"
                      style={{ background: 'var(--scai-teal)' }}
                    >
                      Ir a mis certificados
                    </Link>
                  </div>
                </div>
              )}

              {passed && !loading && (
                <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-5 py-5 sm:px-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20">
                      <Trophy size={24} className="text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-emerald-100">¡Aprobaste el examen!</p>
                      <p className="text-sm text-emerald-200/80 mt-1 leading-relaxed">
                        Tu certificado está listo para descargar.
                      </p>
                    </div>
                  </div>
                  {(result?.nota != null && result?.notaMaxima != null) || result?.score != null || exam?.lastAttempt?.score != null ? (
                    <div className="grid grid-cols-2 gap-3">
                      {result?.nota != null && result?.notaMaxima != null && (
                        <div className="rounded-xl bg-[rgba(4,12,22,0.5)] border border-emerald-500/20 px-3 py-3 text-center">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider">Nota</p>
                          <p className="text-2xl font-bold text-emerald-300 mt-1 tabular-nums">
                            {result.nota}/{result.notaMaxima}
                          </p>
                        </div>
                      )}
                      {(result?.score != null || exam?.lastAttempt?.score != null) && (
                        <div className="rounded-xl bg-[rgba(4,12,22,0.5)] border border-emerald-500/20 px-3 py-3 text-center">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider">Puntaje</p>
                          <p className="text-2xl font-bold text-white mt-1 tabular-nums">
                            {result?.score ?? exam?.lastAttempt?.score}%
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null}
                  {activeCert?.certificateCode && (
                    <p className="text-xs text-white/45 font-mono break-all">
                      Código: {activeCert.certificateCode}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      href="/ver"
                      className="flex-1 text-center rounded-xl py-3 text-sm font-semibold text-white border border-white/15"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      Volver al video
                    </Link>
                    <Link
                      href="/certificado"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white"
                      style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
                    >
                      <Download size={16} />
                      Descargar certificado
                    </Link>
                  </div>
                </div>
              )}

              {failed && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 space-y-2">
                  <p className="text-sm font-bold text-amber-100">No aprobaste esta vez</p>
                  <p className="text-xs text-amber-100/80">
                    {result?.nota != null && result?.notaMaxima != null
                      ? `Nota: ${result.nota}/${result.notaMaxima}. `
                      : result?.score != null
                        ? `Puntaje: ${result.score}%. `
                        : ''}
                    Puedes reintentar respondiendo de nuevo.
                  </p>
                </div>
              )}

              {canTake && exam?.questions.map((q, i) => {
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
                    <div className="mt-4 sm:mt-5 grid gap-2.5">
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

              {!loading && !error && !passed && !canTake && (
                <div className="rounded-2xl border border-white/10 bg-[rgba(4,12,22,0.55)] px-5 py-5 space-y-4">
                  <p className="text-sm text-white/65">No puedes rendir este examen en este momento.</p>
                  <Link
                    href="/certificado"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
                    style={{ background: 'var(--scai-teal)' }}
                  >
                    <CheckCircle2 size={16} />
                    Ir a certificados
                  </Link>
                </div>
              )}
            </div>

            {canTake && exam && (
              <div
                className="px-6 sm:px-8 py-5 border-t border-white/8"
                style={{ background: 'rgba(4,12,22,0.4)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <p className="text-xs text-white/45 sm:flex-1 text-center sm:text-left">
                    {answeredCount < questionsCount
                      ? `Faltan ${questionsCount - answeredCount} preguntas por responder`
                      : 'Todas las preguntas respondidas — listo para validar'}
                  </p>
                  <button
                    type="button"
                    disabled={submitting || answeredCount < questionsCount}
                    onClick={async () => {
                      if (!exam || !canTake) return
                      setSubmitting(true)
                      setError('')
                      try {
                        const answers = exam.questions
                          .map(q => ({ questionId: q.id, optionId: selected[q.id] }))
                          .filter(a => typeof a.optionId === 'string' && a.optionId.length > 0)
                        if (answers.length < exam.questions.length) {
                          throw new Error('Responde todas las preguntas antes de validar.')
                        }
                        const res = await submitExam(exam.id, answers)
                        if (!res) throw new Error('No se pudo validar el examen')
                        setResult(res)
                        if (res.passed) {
                          setPassed(true)
                          setCertPassedLocal(true)
                          let cert = res.certificate ?? null
                          if (!cert) cert = await issueCertificate(exam.id).catch(() => null)
                          if (cert) {
                            setCertificate(cert)
                            setResult(r => r ? { ...r, certificate: cert } : r)
                          }
                          setExam(prev => prev ? {
                            ...prev,
                            passed: true,
                            canTakeExam: false,
                            questions: [],
                            certificate: cert ?? prev.certificate,
                          } : prev)
                        } else {
                          setExam(prev => prev ? {
                            ...prev,
                            canTakeExam: res.canTakeExam !== false,
                            passed: false,
                          } : prev)
                        }
                      } catch (e: any) {
                        setError(e?.message ?? 'Error al validar')
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                    className="w-full sm:w-auto sm:min-w-[200px] text-white font-semibold py-3.5 px-8 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
                  >
                    {submitting ? 'Validando...' : 'Validar examen'}
                  </button>
                </div>
              </div>
            )}
          </AttendanceCertCard>
        )}
      </div>
    </div>
  )
}
