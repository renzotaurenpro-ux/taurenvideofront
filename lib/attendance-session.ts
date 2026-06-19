import type { AttendanceCertificateData, AttendanceCertificateType } from '@/lib/attendance'

export type AttendanceSessionCert = {
  certificate: AttendanceCertificateData
  message: string
}

type EmailCerts = Partial<Record<AttendanceCertificateType, AttendanceSessionCert>>

type AttendanceSessionRoot = {
  email: string
  certs: EmailCerts
}

const CERT_KEY = '__attendance_certs_v3'
const LEGACY_KEYS = ['__attendance_certs_v1', '__attendance_certs_v2', '__attendance_certs_v3']

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function readRoot(): AttendanceSessionRoot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CERT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AttendanceSessionRoot
    if (!parsed || typeof parsed.email !== 'string' || !parsed.certs) return null
    return parsed
  } catch {
    return null
  }
}

function writeRoot(root: AttendanceSessionRoot) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(CERT_KEY, JSON.stringify(root))
  } catch {}
}

function getCertsForEmail(email: string): EmailCerts {
  const normalized = normalizeEmail(email)
  const root = readRoot()
  if (!root || root.email !== normalized) return {}
  return root.certs
}

export function getAttendanceSessionEmail(): string | null {
  return readRoot()?.email ?? null
}

export function resetAttendanceSession() {
  if (typeof window === 'undefined') return
  for (const key of LEGACY_KEYS) {
    try {
      sessionStorage.removeItem(key)
    } catch {}
  }
}

export function setAttendanceSessionEmail(email: string) {
  const normalized = normalizeEmail(email)
  const root = readRoot()
  if (root?.email === normalized) return
  writeRoot({ email: normalized, certs: {} })
}

export function bindAttendanceSessionToEmail(email: string) {
  const normalized = normalizeEmail(email)
  const root = readRoot()
  if (root?.email === normalized) return
  writeRoot({ email: normalized, certs: {} })
}

export function saveAttendanceCertificate(
  email: string,
  certificate: AttendanceCertificateData,
  message: string,
  type: AttendanceCertificateType = certificate.certificateType ?? 'LIVE_VIEWING',
) {
  const normalized = normalizeEmail(email)
  const certEmail = certificate.recipient.email.trim().toLowerCase()
  if (certEmail && certEmail !== normalized) return
  const root = readRoot()
  const certs = root?.email === normalized ? { ...root.certs } : {}
  certs[type] = { certificate: { ...certificate, certificateType: type }, message }
  writeRoot({ email: normalized, certs })
}

export function loadAttendanceCertificate(
  email: string,
  type?: AttendanceCertificateType,
): AttendanceSessionCert | null {
  const certs = getCertsForEmail(email)
  if (type) return certs[type] ?? null
  return certs.LIVE_VIEWING ?? certs.EXAM ?? null
}

export function loadAllAttendanceCertificates(email: string): EmailCerts {
  return getCertsForEmail(email)
}

export function clearAttendanceCertificate(email?: string, type?: AttendanceCertificateType) {
  if (typeof window === 'undefined') return
  if (!email) {
    resetAttendanceSession()
    return
  }
  const normalized = normalizeEmail(email)
  const root = readRoot()
  if (!root || root.email !== normalized) return
  if (!type) {
    writeRoot({ email: normalized, certs: {} })
    return
  }
  const certs = { ...root.certs }
  delete certs[type]
  writeRoot({ email: normalized, certs })
}
