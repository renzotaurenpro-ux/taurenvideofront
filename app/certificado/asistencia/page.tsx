'use client'

import { useEffect, useState } from 'react'
import { Mail, AlertCircle } from 'lucide-react'
import AttendanceCertLayout from '@/components/AttendanceCertLayout'
import AttendanceCertHeader, { AttendanceCertCard } from '@/components/AttendanceCertHeader'
import { bindAttendanceSessionToEmail, resetAttendanceSession } from '@/lib/attendance-session'

export default function CertificadoAsistenciaPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [inputReady, setInputReady] = useState(false)

  useEffect(() => {
    resetAttendanceSession()
    setInputReady(true)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Ingresa un correo válido')
      return
    }
    bindAttendanceSessionToEmail(trimmed)
    const target = `/certificado/asistencia/opciones?email=${encodeURIComponent(trimmed)}&_=${Date.now()}`
    window.location.replace(target)
  }

  return (
    <AttendanceCertLayout step="correo">
      <AttendanceCertCard>
        <AttendanceCertHeader subtitle="III Jornadas Regionales de Inmunología Clínica · Ingresa el correo con el que participaste del evento" />
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" autoComplete="off">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/12 border border-red-500/25 rounded-xl px-3.5 py-3 text-red-300 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <input type="text" name="fake-email" autoComplete="username" tabIndex={-1} aria-hidden="true" className="hidden" />
          <div>
            <label htmlFor="attendance-email-input" className="block text-white/60 text-[11px] font-medium mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                id="attendance-email-input"
                type="email"
                name="attendance-email-input"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                required
                readOnly={!inputReady}
                onFocus={e => e.currentTarget.removeAttribute('readonly')}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="doctor@hospital.com"
                className="w-full rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/25 focus:outline-none border border-white/12 focus:border-[rgba(18,180,198,0.55)] bg-[rgba(4,12,22,0.9)] transition-colors text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full text-white font-semibold py-3.5 rounded-xl text-sm"
            style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.28)' }}
          >
            Continuar
          </button>
        </form>
      </AttendanceCertCard>
    </AttendanceCertLayout>
  )
}
