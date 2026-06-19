'use client'

import { useEffect, useState } from 'react'
import { Mail, AlertCircle } from 'lucide-react'
import AttendanceCertLayout from '@/components/AttendanceCertLayout'
import AttendanceCertHeader, { AttendanceCertCard } from '@/components/AttendanceCertHeader'
import { resetAttendanceSession, setAttendanceSessionEmail } from '@/lib/attendance-session'
import { warmupBackend } from '@/lib/api'

export default function CertificadoAsistenciaPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    resetAttendanceSession()
    warmupBackend()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Ingresa un correo válido')
      return
    }
    setAttendanceSessionEmail(trimmed)
    window.location.assign(`/certificado/asistencia/opciones?email=${encodeURIComponent(trimmed)}`)
  }

  return (
    <AttendanceCertLayout step="correo">
      <AttendanceCertCard>
        <AttendanceCertHeader subtitle="III Jornadas Regionales de Inmunología Clínica · Ingresa el correo con el que participaste del evento" />
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/12 border border-red-500/25 rounded-xl px-3.5 py-3 text-red-300 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-white/60 text-[11px] font-medium mb-1.5">Correo electrónico</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                name="attendance-email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
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
