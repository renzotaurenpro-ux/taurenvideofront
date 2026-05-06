'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Award } from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { CERT_PASSED_KEY } from '@/lib/certTest'
import { fetchExams, fetchExamById, issueCertificate, submitExam, type Exam, type ExamSubmitResult } from '@/lib/exams'
import { fetchPublishedVideos } from '@/lib/videos'
import { fetchAuth } from '@/lib/api'

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
        const videos = await fetchPublishedVideos()
        const video = videos[0] ?? null
        if (video?.id) {
          const check = await fetchAuth(`/purchases/check/${video.id}`).catch(() => null)
          const hasPurchase = check?.ok
            ? await check.json().then((d: any) => d?.purchased === true || d?.hasPurchase === true).catch(() => false)
            : false
          if (!cancelled) setPurchased(hasPurchase)
          if (!hasPurchase) {
            if (!cancelled) setLoading(false)
            return
          }
        }
        const exams = await fetchExams()
        const picked = exams.find(e => e.published !== false) ?? exams[0]
        if (!picked?.id) throw new Error('No hay examen disponible')
        const full = await fetchExamById(picked.id)
        if (!full?.id || !Array.isArray(full.questions) || full.questions.length === 0) throw new Error('Examen inválido')
        if (!cancelled) {
          setExam(full)
          setSelected({})
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

  const questionsCount = exam?.questions?.length ?? 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <Link href="/ver" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Volver al video
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Award size={14} style={{ color: 'var(--scai-teal)' }} />
            <span>{questionsCount} preguntas</span>
          </div>
          {!loading && purchased && !error && !result?.passed && (
            <button
              type="button"
              onClick={() => document.getElementById('preguntas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white"
              style={{ background: 'var(--scai-teal)' }}
            >
              Realizar examen
            </button>
          )}
          {!loading && purchased && !error && result?.passed && (
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
          <p className="mt-2 text-sm text-muted-foreground">Responde y presiona validar examen.</p>
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
        ) : exam ? (
          <section id="preguntas" className="space-y-5 scroll-mt-24">
            {exam.questions.map((q, i) => (
              <div key={q.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <p className="text-sm font-semibold leading-snug text-foreground">{i + 1}. {q.text}</p>
                <div className="mt-3 grid sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => {
                    const active = selected[q.id] === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelected(s => ({ ...s, [q.id]: opt.id }))}
                        className={`text-left rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                          active
                            ? 'border-[color:var(--scai-teal)] bg-[rgba(18,180,198,0.12)] text-foreground'
                            : 'border-border bg-secondary/50 text-foreground/85 hover:bg-secondary'
                        }`}
                      >
                        {opt.text}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="text-sm text-muted-foreground">
            {result ? (
              <span>
                Resultado:{' '}
                <span style={{ color: result.passed ? '#4ade80' : '#fbbf24' }} className="font-bold">
                  {result.nota}/{result.notaMaxima}
                </span>
                {result.passed ? ' — Aprobado' : ` — Aprobación ${result.notaAprobacion}`}
              </span>
            ) : (
              <span>Completa todas las preguntas y valida.</span>
            )}
          </div>
          <button
            type="button"
            disabled={loading || submitting || !exam}
            onClick={async () => {
              if (!exam) return
              setSubmitting(true)
              setError('')
              try {
                const answers = exam.questions
                  .map(q => ({ questionId: q.id, optionId: selected[q.id] }))
                  .filter(a => typeof a.optionId === 'string' && a.optionId.length > 0)
                const res = await submitExam(exam.id, answers)
                if (!res) throw new Error('No se pudo validar el examen')
                setResult(res)
                if (res.passed) {
                  try { sessionStorage.setItem(CERT_PASSED_KEY, '1') } catch {}
                  await issueCertificate(exam.id).catch(() => {})
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
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {result?.passed && (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Link href="/ver" className="flex-1 text-center rounded-xl py-3 text-sm font-bold border border-border bg-secondary/60 text-foreground hover:bg-secondary">
                Volver al video
              </Link>
              <Link href="/certificado" className="flex-1 text-center rounded-xl py-3 text-sm font-bold text-white border border-[color:rgba(18,180,198,0.45)]"
                style={{ background: 'rgba(18,180,198,0.25)' }}>
                Descargar certificado
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
