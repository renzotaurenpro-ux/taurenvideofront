import Link from 'next/link'
import { AlertCircle, CheckCircle2, ClipboardList, Info, RotateCcw, Trophy, XCircle } from 'lucide-react'
import type { AttendanceExamSubmitResult } from '@/lib/attendance'
import {
  ATTENDANCE_EXAM_MAX_GRADE,
  ATTENDANCE_EXAM_MAX_WRONG,
  ATTENDANCE_EXAM_MIN_CORRECT,
  ATTENDANCE_EXAM_PASS_GRADE,
  ATTENDANCE_EXAM_TOTAL,
  formatAttendanceExamGrade,
} from '@/lib/attendance-exam'

export function AttendanceExamRules() {
  const items = [
    { label: 'Preguntas', value: String(ATTENDANCE_EXAM_TOTAL), accent: false },
    { label: 'Nota mínima', value: formatAttendanceExamGrade(ATTENDANCE_EXAM_PASS_GRADE), accent: true },
    { label: 'Máx. errores', value: String(ATTENDANCE_EXAM_MAX_WRONG), accent: false },
    { label: 'Mín. correctas', value: String(ATTENDANCE_EXAM_MIN_CORRECT), accent: 'green' as const },
  ]

  return (
    <div
      className="rounded-2xl border px-5 py-4 sm:px-6 sm:py-5 space-y-4"
      style={{
        borderColor: 'rgba(18,180,198,0.32)',
        background: 'linear-gradient(135deg, rgba(18,180,198,0.12) 0%, rgba(8,18,32,0.55) 100%)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'rgba(18,180,198,0.2)' }}
        >
          <Info size={16} style={{ color: 'var(--scai-teal)' }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Requisitos para aprobar</p>
          <p className="text-[11px] text-white/45 mt-0.5">Escala de 1 a {ATTENDANCE_EXAM_MAX_GRADE}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map(item => (
          <div
            key={item.label}
            className="rounded-xl bg-[rgba(4,12,22,0.65)] border border-white/10 px-4 py-3 text-center"
          >
            <p className="text-[10px] uppercase tracking-widest text-white/40">{item.label}</p>
            <p
              className="text-xl font-bold mt-1 tabular-nums"
              style={{
                color: item.accent === true
                  ? 'var(--scai-teal)'
                  : item.accent === 'green'
                    ? '#6ee7b7'
                    : '#ffffff',
              }}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/50 leading-relaxed text-center sm:text-left">
        Ejemplo: {ATTENDANCE_EXAM_MIN_CORRECT} correctas = nota 5,1 · puedes equivocarte hasta {ATTENDANCE_EXAM_MAX_WRONG} veces.
      </p>
    </div>
  )
}

type ResultProps = {
  result: AttendanceExamSubmitResult
  email: string
  onRetry: () => void
}

export function AttendanceExamResult({ result, email, onRetry }: ResultProps) {
  const total = result.total ?? ATTENDANCE_EXAM_TOTAL
  const correctas = result.correctas ?? 0
  const incorrectas = Math.max(0, total - correctas)
  const nota = result.nota
  const passed = result.passed
  const resultadoUrl = `/certificado/asistencia/resultado?email=${encodeURIComponent(email)}&type=exam`

  if (passed) {
    return (
      <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-5 py-5 sm:px-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20">
            <Trophy size={24} className="text-emerald-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-emerald-100">¡Aprobaste el examen!</p>
            <p className="text-sm text-emerald-200/80 mt-1 leading-relaxed">{result.message}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[rgba(4,12,22,0.5)] border border-emerald-500/20 px-3 py-3 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Nota</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1 tabular-nums">
              {typeof nota === 'number' ? formatAttendanceExamGrade(nota) : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-[rgba(4,12,22,0.5)] border border-emerald-500/20 px-3 py-3 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Correctas</p>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">{correctas}/{total}</p>
          </div>
          <div className="rounded-xl bg-[rgba(4,12,22,0.5)] border border-emerald-500/20 px-3 py-3 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Errores</p>
            <p className="text-2xl font-bold text-white mt-1 tabular-nums">{incorrectas}</p>
          </div>
        </div>
        <Link
          href={resultadoUrl}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white"
          style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
        >
          <CheckCircle2 size={17} />
          Ver mi certificado
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-5 sm:px-6 space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/20">
          <XCircle size={24} className="text-red-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-red-100">No alcanzaste la nota mínima</p>
          <p className="text-sm text-red-200/80 mt-1 leading-relaxed">
            {result.message || 'Necesitas al menos 11 respuestas correctas (nota 5,0) para aprobar.'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[rgba(4,12,22,0.5)] border border-red-500/20 px-3 py-3 text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Tu nota</p>
          <p className="text-2xl font-bold text-red-300 mt-1 tabular-nums">
            {typeof nota === 'number' ? formatAttendanceExamGrade(nota) : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-[rgba(4,12,22,0.5)] border border-red-500/20 px-3 py-3 text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Correctas</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">{correctas}/{total}</p>
        </div>
        <div className="rounded-xl bg-[rgba(4,12,22,0.5)] border border-red-500/20 px-3 py-3 text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Errores</p>
          <p className="text-2xl font-bold text-red-300 mt-1 tabular-nums">{incorrectas}</p>
        </div>
      </div>
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
        <AlertCircle size={16} className="text-amber-300 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-100/90 leading-relaxed">
          Puedes tener hasta {ATTENDANCE_EXAM_MAX_WRONG} respuestas incorrectas. Te faltaron{' '}
          {Math.max(0, ATTENDANCE_EXAM_MIN_CORRECT - correctas)} correctas para aprobar.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white border border-white/15"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <RotateCcw size={16} />
        Intentar de nuevo
      </button>
    </div>
  )
}

export function AttendanceExamProgress({ answered, total }: { answered: number; total: number }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0
  return (
    <div
      className="px-6 sm:px-8 py-3.5 border-b border-white/8"
      style={{ background: 'rgba(4,12,22,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-white/55 font-medium">Progreso del examen</span>
        <span className="font-bold tabular-nums" style={{ color: 'var(--scai-teal)' }}>
          {answered}/{total} respondidas
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'var(--scai-teal)', boxShadow: '0 0 12px rgba(18,180,198,0.45)' }}
        />
      </div>
    </div>
  )
}

export function AttendanceExamHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      className="px-6 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-white/8"
      style={{ background: 'linear-gradient(180deg, rgba(18,180,198,0.08) 0%, transparent 100%)' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(18,180,198,0.15)', border: '1px solid rgba(18,180,198,0.3)' }}
        >
          <ClipboardList size={22} style={{ color: 'var(--scai-teal)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">{title}</h1>
          <p className="text-white/50 text-sm mt-1.5">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
