import Link from 'next/link'
import Image from 'next/image'
import { Award } from 'lucide-react'
import ScaiLogo from '../Logotipo-SCAI.png'

type Props = {
  subtitle?: string
  email?: string
}

export default function AttendanceCertHeader({ subtitle, email }: Props) {
  return (
    <div className="px-6 pt-5 pb-2 text-center">
      <Image src={ScaiLogo} alt="SCAI" priority className="h-7 w-auto mx-auto mb-4" />
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(18,180,198,0.12)', border: '1px solid rgba(18,180,198,0.25)' }}
      >
        <Award size={28} style={{ color: 'var(--scai-teal)' }} />
      </div>
      <h1 className="text-xl font-bold text-white tracking-[0.12em]">CERTIFICADOS</h1>
      {email && (
        <p className="text-[var(--scai-teal)] text-xs mt-2 font-medium truncate px-2">{email}</p>
      )}
      {subtitle && (
        <p className="text-white/50 text-xs mt-2 leading-relaxed max-w-sm mx-auto">{subtitle}</p>
      )}
    </div>
  )
}

export function AttendanceCertCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-white/12 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      style={{ background: 'rgba(8,18,32,0.92)', backdropFilter: 'blur(16px)' }}
    >
      {children}
    </div>
  )
}

export function AttendanceOptionButton({
  title,
  description,
  onClick,
  href,
  loading,
  disabled,
  variant = 'primary',
}: {
  title: string
  description: string
  onClick?: () => void
  href?: string
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}) {
  const className = `w-full text-left rounded-xl border px-4 py-4 transition-colors disabled:opacity-50 ${
    variant === 'primary'
      ? 'border-[rgba(18,180,198,0.35)] bg-[rgba(18,180,198,0.1)] hover:bg-[rgba(18,180,198,0.18)]'
      : 'border-white/12 bg-[rgba(4,12,22,0.6)] hover:border-[rgba(18,180,198,0.35)]'
  }`

  const inner = (
    <>
      <p className="text-sm font-bold text-white">{loading ? 'Cargando...' : title}</p>
      <p className="text-xs text-white/50 mt-1 leading-relaxed">{description}</p>
    </>
  )

  if (href && !disabled) {
    return <Link href={href} className={`block ${className}`}>{inner}</Link>
  }

  return (
    <button type="button" onClick={onClick} disabled={loading || disabled} className={className}>
      {inner}
    </button>
  )
}
