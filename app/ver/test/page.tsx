'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Award } from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { setCertPassedLocal } from '@/lib/certTest'
import {
  examHasCertificateAccess,
  fetchPublishedExam,
  issueCertificate,
  submitExam,
  type Exam,
  type ExamSubmitResult,
} from '@/lib/exams'
import { fetchPublishedCourse, checkCoursePurchase } from '@/lib/courses'
import { getCachedPurchase, setCachedPurchase } from '@/lib/api'

export default function VerTestPage() {
  const router = useRouter()
  const { firebaseUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [exam, setExam] = useState<Exam | null>(null)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ExamSubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [purchased, setPurchased] = useState(false)

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

        const full = await fetchPublishedExam()
        if (!full) throw new Error('No se pudo cargar el examen. Revisa que esté publicado en el servidor.')
        if (!cancelled) {
          setExam(full)
          setSelected({})
          if (examHasCertificateAccess(full)) {
            setCertPassedLocal(true)
            setResult({
              passed: true,
              canTakeExam: false,
              certificate: full.certificate,
              score: full.lastAttempt?.score,
            })
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-2 animate-spin border-muted-foreground border-t-[color:var(--scai-teal)]" />
      </div>
    )
  }

  const canTake = exam?.canTakeExam === true && !exam.passed && !result?.passed
  const questionsCount = exam?.questions?.length ?? 0
  const passed = result?.passed === true || exam?.passed === true
  const certificate = result?.certificate ?? exam?.certificate

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <Link href="/ver" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Volver al video
        </Link>
        <div className="flex items-center gap-2">
          {canTake && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Award size={14} style={{ color: 'var(--scai-teal)' }} />
              <span>{questionsCount} preguntas</span>
            </div>
          )}
          {!loading && purchased && !error && canTake && (
            <button
              type="button"
              onClick={() => document.getElementById('preguntas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white"
              style={{ background: 'var(--scai-teal)' }}
            >
              Realizar examen
            </button>
          )}
          {!loading && purchased && !error && passed && (
            <Link
              href="/certificado"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white border border-[color:rgba(18,180,198,0.45)]"
              style={{ background: 'rgba(18,180,198,0.25)' }}
            >
              Descargar certificado
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Certificación</p>
          <h1 className="mt-1 text-xl sm:text-2xl font-black">{exam?.title ?? exam?.name ?? 'Examen'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {passed
              ? 'Ya aprobaste este examen. Tu certificado está disponible para descargar.'
              : canTake
                ? 'Responde y presiona validar examen.'
                : 'Estado del examen.'}
          </p>
        </div>

        {!loading && !purchased && !error && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Debes adquirir el acceso al video para realizar el test y obtener tu certificado.
            </p>
            <Link href="/carrito" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white"
              style={{ background: 'var(--scai-teal)' }}>
              Obtener acceso
            </Link>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Cargando examen...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-400">
            {error}
          </div>
        ) : passed ? (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm font-semibold" style={{ color: '#4ade80' }}>
              Examen aprobado
            </p>
            {(result?.nota != null && result?.notaMaxima != null) && (
              <p className="text-sm text-muted-foreground">
                Nota: <span className="font-bold text-foreground">{result.nota}/{result.notaMaxima}</span>
              </p>
            )}
            {(result?.score != null || exam?.lastAttempt?.score != null) && (
              <p className="text-sm text-muted-foreground">
                Puntaje: <span className="font-bold text-foreground">{result?.score ?? exam?.lastAttempt?.score}%</span>
              </p>
            )}
            {certificate?.certificateCode && (
              <p className="text-xs text-muted-foreground">
                Código: <span className="font-mono text-foreground">{certificate.certificateCode}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Link href="/ver" className="flex-1 text-center rounded-xl py-3 text-sm font-bold border border-border bg-secondary/60 text-foreground hover:bg-secondary">
                Volver al video
              </Link>
              <Link href="/certificado" className="flex-1 text-center rounded-xl py-3 text-sm font-bold text-white border border-[color:rgba(18,180,198,0.45)]"
                style={{ background: 'rgba(18,180,198,0.25)' }}>
                Descargar certificado
              </Link>
            </div>
          </div>
        ) : exam && canTake ? (
          <>
            <section id="preguntas" className="space-y-5 scroll-mt-24">
              {exam.questions.map((q, i) => (
                <div key={q.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <p className="text-sm font-semibold leading-snug text-foreground">{i + 1}. {q.text}</p>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => {
                      const active = selected[q.id] === opt.id
                      const letter = String.fromCharCode(65 + oi)
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelected(s => ({ ...s, [q.id]: opt.id }))}
                          className={`flex items-start gap-2.5 text-left rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                            active
                              ? 'border-[color:var(--scai-teal)] bg-[rgba(18,180,198,0.12)] text-foreground'
                              : 'border-border bg-secondary/50 text-foreground/85 hover:bg-secondary'
                          }`}
                        >
                          <span
                            className="flex-shrink-0 mt-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={active ? { background: 'var(--scai-teal)', color: '#fff' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 leading-snug">{opt.text}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </section>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="text-sm text-muted-foreground">
                {result && !result.passed ? (
                  <span>
                    Resultado:{' '}
                    <span style={{ color: '#fbbf24' }} className="font-bold">
                      {result.nota != null && result.notaMaxima != null
                        ? `${result.nota}/${result.notaMaxima}`
                        : result.score != null
                          ? `${result.score}%`
                          : 'No aprobado'}
                    </span>
                    {result.notaAprobacion != null ? ` — Aprobación ${result.notaAprobacion}` : ' — Puedes reintentar'}
                  </span>
                ) : (
                  <span>Completa todas las preguntas y valida.</span>
                )}
              </div>
              <button
                type="button"
                disabled={loading || submitting || !exam || exam.questions.length === 0}
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
                      setCertPassedLocal(true)
                      setExam(prev => prev ? {
                        ...prev,
                        passed: true,
                        canTakeExam: false,
                        questions: [],
                        certificate: res.certificate ?? prev.certificate,
                      } : prev)
                      if (!res.certificate) {
                        const issued = await issueCertificate(exam.id).catch(() => null)
                        if (issued) {
                          setResult(r => r ? { ...r, certificate: issued } : r)
                          setExam(prev => prev ? { ...prev, certificate: issued } : prev)
                        }
                      }
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
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 24px rgba(18,180,198,0.25)' }}
              >
                {submitting ? 'Validando...' : 'Validar examen'}
              </button>
            </div>
          </>
        ) : exam ? (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              No puedes rendir este examen en este momento.
            </p>
            <Link href="/certificado" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white"
              style={{ background: 'var(--scai-teal)' }}>
              Ir a certificados
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  )
}
