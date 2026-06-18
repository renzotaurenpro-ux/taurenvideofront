'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Award,
  CheckCircle2,
  Home,
  Mail,
  AlertCircle,
  ClipboardCheck,
  ArrowRight,
  Download,
  ArrowLeft,
} from 'lucide-react'
import ScaiLogo from '../../../Logotipo-SCAI.png'
import PageBackground from '@/components/PageBackground'
import AttendanceCertificateCard from '@/components/AttendanceCertificateCard'
import {
  claimAttendanceCertificate,
  fetchAttendanceExam,
  submitAttendanceExam,
  type AttendanceClaimResult,
  type AttendanceCertificateData,
  type AttendanceExam,
  type AttendanceExamSubmitResult,
} from '@/lib/attendance'
import { warmupBackend } from '@/lib/api'
import { downloadAttendanceCertificatePdf } from '@/lib/attendance-certificate-pdf'

type Step = 'form' | 'exam' | 'certificate'

export default function CertificadoAsistenciaPage() {
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [examLoading, setExamLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AttendanceClaimResult | null>(null)
  const [certificate, setCertificate] = useState<AttendanceCertificateData | null>(null)
  const [exam, setExam] = useState<AttendanceExam | null>(null)
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [submitResult, setSubmitResult] = useState<AttendanceExamSubmitResult | null>(null)
  const [downloading, setDownloading] = useState(false)
  const certRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    warmupBackend()
  }, [])

  function showCertificate(data: AttendanceCertificateData, message?: string) {
    setCertificate(data)
    setResult(prev => ({
      status: 'CERTIFICATE_ISSUED',
      message: message ?? prev?.message ?? 'Tu certificado está listo.',
      canTakeExam: false,
      certificate: data,
    }))
    setStep('certificate')
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setCertificate(null)
    setSubmitResult(null)
    setExam(null)
    setSelected({})

    const trimmed = email.trim()
    if (!trimmed) {
      setError('Ingresa tu correo electrónico')
      return
    }

    setLoading(true)
    try {
      const data = await claimAttendanceCertificate(trimmed)
      setResult(data)
      if (data.certificate) {
        showCertificate(data.certificate, data.message)
        return
      }
      setStep('form')
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al consultar')
    } finally {
      setLoading(false)
    }
  }

  async function startExam() {
    const trimmed = email.trim()
    if (!trimmed) return
    setExamLoading(true)
    setError('')
    setSubmitResult(null)
    setSelected({})
    try {
      const data = await fetchAttendanceExam(trimmed)
      setExam(data)
      setStep('exam')
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'No se pudo cargar el examen')
    } finally {
      setExamLoading(false)
    }
  }

  async function handleSubmitExam() {
    if (!exam) return
    const trimmed = email.trim()
    if (!trimmed) return

    const unanswered = exam.questions.filter(q => !selected[q.id])
    if (unanswered.length > 0) {
      setError('Responde todas las preguntas antes de enviar')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const answers = exam.questions.map(q => ({
        questionId: q.id,
        optionId: selected[q.id],
      }))
      const res = await submitAttendanceExam(trimmed, answers)
      setSubmitResult(res)
      if (res.passed && res.certificate) {
        showCertificate(res.certificate, res.message)
      }
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Error al enviar el examen')
    } finally {
      setSubmitting(false)
    }
  }

  async function downloadPdf() {
    if (downloading || !certificate) return
    setDownloading(true)
    try {
      await downloadAttendanceCertificatePdf(
        certificate.recipient.fullName,
        certificate.certificateCode,
        window.location.origin,
      )
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'No se pudo generar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  function resetAll() {
    setStep('form')
    setResult(null)
    setCertificate(null)
    setExam(null)
    setSelected({})
    setSubmitResult(null)
    setError('')
    setEmail('')
  }

  const cardClass = 'rounded-2xl border border-white/12 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)]'
  const cardStyle = { background: 'rgba(8,18,32,0.92)', backdropFilter: 'blur(16px)' as const }

  return (
    <div className="relative min-h-[100dvh] min-h-screen w-full">
      <PageBackground scene="login" />

      <Link
        href="/"
        className="fixed top-[max(1rem,env(safe-area-inset-top,0px)+0.75rem)] left-[max(1rem,env(safe-area-inset-left,0px)+0.75rem)] z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white/80 hover:text-white border border-white/15 bg-[rgba(8,18,32,0.75)] hover:bg-[rgba(8,18,32,0.9)] backdrop-blur-md transition-colors"
      >
        <Home size={14} style={{ color: 'var(--scai-teal)' }} />
        Inicio
      </Link>

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-[max(5rem,calc(env(safe-area-inset-top,0px)+4rem))] pb-12">
        {step === 'certificate' && certificate ? (
          <div className="space-y-4">
            <div
              className="rounded-2xl border border-[rgba(18,180,198,0.35)] px-5 py-4 flex items-start gap-3"
              style={{ background: 'rgba(18,180,198,0.1)' }}
            >
              <CheckCircle2 size={22} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">{result?.message}</p>
                <p className="text-xs text-white/55 mt-1">Tu certificado está listo para descargar.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={downloadPdf}
              disabled={downloading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
            >
              <Download size={16} />
              {downloading ? 'Generando PDF...' : 'Descargar certificado PDF'}
            </button>

            <button
              type="button"
              onClick={resetAll}
              className="w-full text-center text-xs text-white/45 hover:text-white/70 py-2 transition-colors"
            >
              Consultar otro correo
            </button>
          </div>
        ) : step === 'exam' && exam ? (
          <div className={cardClass} style={cardStyle}>
            <div className="px-6 pt-6 pb-2">
              <button
                type="button"
                onClick={() => { setStep('form'); setExam(null); setSubmitResult(null); setError('') }}
                className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 mb-4"
              >
                <ArrowLeft size={14} />
                Volver
              </button>
              <h1 className="text-lg font-bold text-white">{exam.title}</h1>
              <p className="text-white/50 text-xs mt-1">{exam.questions.length} preguntas · Nota mínima 5.0</p>
            </div>

            <div className="px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
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
                    <span className="block mt-1 text-white/60">
                      Nota: {submitResult.nota}/{submitResult.notaMaxima ?? 7}
                    </span>
                  )}
                </div>
              )}

              {exam.questions.map((q, i) => (
                <div key={q.id} className="rounded-xl border border-white/10 bg-[rgba(4,12,22,0.6)] p-4">
                  <p className="text-sm font-semibold text-white leading-snug">{i + 1}. {q.text}</p>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, oi) => {
                      const active = selected[q.id] === opt.id
                      const letter = String.fromCharCode(65 + oi)
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
                            {letter}
                          </span>
                          <span className="flex-1 leading-snug">{opt.text}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 border-t border-white/8">
              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={submitting}
                className="w-full text-white font-semibold py-3.5 rounded-xl text-sm disabled:opacity-50"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
              >
                {submitting ? 'Enviando...' : 'Enviar examen'}
              </button>
            </div>
          </div>
        ) : (
          <div className={cardClass} style={cardStyle}>
            <div className="px-6 pt-7 pb-2 text-center">
              <Link href="/" className="inline-flex justify-center mb-4">
                <Image src={ScaiLogo} alt="SCAI" priority className="h-7 w-auto" />
              </Link>
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(18,180,198,0.12)', border: '1px solid rgba(18,180,198,0.25)' }}
              >
                <Award size={28} style={{ color: 'var(--scai-teal)' }} />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Certificado de asistencia</h1>
              <p className="text-white/50 text-xs mt-2 leading-relaxed max-w-sm mx-auto">
                III Jornadas Regionales de Inmunología Clínica · Ingresa el correo con el que participaste del evento
              </p>
            </div>

            <form onSubmit={handleClaim} className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/12 border border-red-500/25 rounded-xl px-3.5 py-3 text-red-300 text-xs leading-snug">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {result && result.status === 'NOT_ELIGIBLE' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ClipboardCheck size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-200">Aún no cumples el 80% de visualización</p>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{result.message}</p>
                    </div>
                  </div>
                  {result.canTakeExam && (
                    <button
                      type="button"
                      onClick={startExam}
                      disabled={examLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
                      style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
                    >
                      {examLoading ? 'Cargando examen...' : 'Realizar test'}
                      {!examLoading && <ArrowRight size={16} />}
                    </button>
                  )}
                </div>
              )}

              {result && result.status === 'NOT_FOUND' && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-200">Correo no encontrado</p>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{result.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white/60 text-[11px] font-medium mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="doctor@hospital.com"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/25 focus:outline-none border border-white/12 focus:border-[rgba(18,180,198,0.55)] bg-[rgba(4,12,22,0.9)] transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm disabled:opacity-50"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
              >
                {loading ? 'Consultando...' : 'Consultar mi certificado'}
              </button>
            </form>

            <div className="px-6 py-4 border-t border-white/8">
              <p className="text-[10px] text-white/40 text-center leading-relaxed">
                Si no alcanzaste el 80% de visualización, podrás realizar el test con el mismo correo.
              </p>
            </div>
          </div>
        )}
      </div>

      {step === 'certificate' && certificate && (
        <div className="relative z-10 flex justify-center px-4 pb-16">
          <div className="w-full max-w-[810px]">
            <AttendanceCertificateCard ref={certRef} data={certificate} />
          </div>
        </div>
      )}
    </div>
  )
}
