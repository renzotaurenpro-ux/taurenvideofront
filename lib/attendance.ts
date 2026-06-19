import { normalizeSpanishText } from './text-encoding'

const ATTENDANCE_API = '/api/attendance'

export const ATTENDANCE_VERIFY_PATH = '/certificado/validar-asistencia'

export type AttendanceCertificateType = 'LIVE_VIEWING' | 'EXAM'

export const ATTENDANCE_CERT_TITLES: Record<AttendanceCertificateType, string> = {
  LIVE_VIEWING: 'Certificado de Asistencia al Evento en Vivo',
  EXAM: 'Certificado de Examen del Evento',
}

export const ATTENDANCE_CERT_LABELS: Record<AttendanceCertificateType, string> = {
  LIVE_VIEWING: 'CERTIFICADO DE ASISTENCIA AL EVENTO EN VIVO',
  EXAM: 'CERTIFICADO DE EXAMEN DEL EVENTO',
}

export function resolveCertificateTitle(
  data: Pick<AttendanceCertificateData, 'certificateType' | 'certificateTitle'>,
): string {
  if (data.certificateTitle) return data.certificateTitle
  if (data.certificateType === 'EXAM') return ATTENDANCE_CERT_TITLES.EXAM
  return ATTENDANCE_CERT_TITLES.LIVE_VIEWING
}

export function resolveCertificateLabel(
  data: Pick<AttendanceCertificateData, 'certificateType' | 'certificateLabel'>,
): string {
  if (data.certificateLabel) return data.certificateLabel
  if (data.certificateType === 'EXAM') return ATTENDANCE_CERT_LABELS.EXAM
  return ATTENDANCE_CERT_LABELS.LIVE_VIEWING
}

export function resolveCertificateHeading(
  data: Pick<AttendanceCertificateData, 'certificateType' | 'certificateLabel'>,
): string {
  return `${resolveCertificateLabel(data)} A:`
}

export function resolveCertificateBodyText(
  data: Pick<AttendanceCertificateData, 'certificateType' | 'event'>,
): string | null {
  const e = data.event
  if (!e?.eventTitle) return null
  const eventDesc = `las ${e.eventTitle}, "${e.eventSubtitle}", realizadas en modalidad ${e.modality} el ${e.eventDate}.`
  if (data.certificateType === 'EXAM') {
    return `En reconocimiento a haber aprobado el examen correspondiente a ${eventDesc}`
  }
  if (data.certificateType === 'LIVE_VIEWING') {
    return `En reconocimiento a su asistencia al evento en vivo ${eventDesc}`
  }
  return null
}

export type AttendanceClaimStatus =
  | 'NOT_FOUND'
  | 'NOT_ELIGIBLE'
  | 'ALREADY_ISSUED'
  | 'CERTIFICATE_ISSUED'

export type AttendanceEventInfo = {
  organization: string
  type: string
  eventTitle: string
  eventSubtitle: string
  eventDate: string
  modality: string
  director1: string
  director1Role: string
  director2: string
  director2Role: string
}

export type AttendanceCertificateData = {
  certificateCode: string
  certificateType?: AttendanceCertificateType
  certificateTitle?: string
  certificateLabel?: string
  issuedAt: string
  recipient: {
    firstName: string
    lastName: string
    fullName: string
    email: string
  }
  event: AttendanceEventInfo
}

export type AttendanceStatusResult = {
  status: 'OK' | 'NOT_FOUND'
  message?: string
  watchedOver80: boolean
  canClaimViewing: boolean
  canTakeExam: boolean
  canOnlyTakeExam: boolean
  recipient?: AttendanceCertificateData['recipient']
  viewingCertificate: AttendanceCertificateData | null
  examCertificate: AttendanceCertificateData | null
}

export type AttendanceClaimResult = {
  status: AttendanceClaimStatus
  message: string
  certificateType?: AttendanceCertificateType
  certificate: AttendanceCertificateData | null
}

export type AttendanceVerifyResult = {
  valid: boolean
  certificateType?: AttendanceCertificateType | string
  certificateTitle?: string
  certificateLabel?: string
  certificateCode?: string
  issuedAt?: string
  recipient?: {
    firstName: string
    lastName: string
    fullName: string
    email: string
  }
  event?: AttendanceEventInfo
}

export type AttendanceExamOption = {
  id: string
  text: string
}

export type AttendanceExamQuestion = {
  id: string
  text: string
  order?: number
  options: AttendanceExamOption[]
}

export type AttendanceExam = {
  id: string
  title: string
  passingScore?: number
  questions: AttendanceExamQuestion[]
}

export type AttendanceExamAnswer = {
  questionId: string
  optionId: string
}

export type AttendanceExamSubmitStatus = 'FAILED' | 'CERTIFICATE_ISSUED'

export type AttendanceExamSubmitResult = {
  status: AttendanceExamSubmitStatus
  message: string
  correctas?: number
  total?: number
  nota?: number
  notaMaxima?: number
  notaAprobacion?: number
  passed: boolean
  canTakeExam?: boolean
  certificate: AttendanceCertificateData | null
}

function parseCertificate(raw: unknown): AttendanceCertificateData | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const code = typeof o.certificateCode === 'string' ? o.certificateCode : ''
  if (!code) return null
  const recipientRaw = o.recipient
  const eventRaw = o.event
  const r = recipientRaw && typeof recipientRaw === 'object'
    ? recipientRaw as Record<string, unknown>
    : {}
  const e = eventRaw && typeof eventRaw === 'object'
    ? eventRaw as Record<string, unknown>
    : {}
  const certificateType = o.certificateType === 'LIVE_VIEWING' || o.certificateType === 'EXAM'
    ? o.certificateType
    : undefined
  const parsed: AttendanceCertificateData = {
    certificateCode: code,
    certificateType,
    certificateTitle: typeof o.certificateTitle === 'string' ? o.certificateTitle : undefined,
    certificateLabel: typeof o.certificateLabel === 'string' ? o.certificateLabel : undefined,
    issuedAt: typeof o.issuedAt === 'string' ? o.issuedAt : new Date().toISOString(),
    recipient: {
      firstName: normalizeSpanishText(String(r.firstName ?? '')),
      lastName: normalizeSpanishText(String(r.lastName ?? '')),
      fullName: normalizeSpanishText(String(r.fullName ?? `${r.firstName ?? ''} ${r.lastName ?? ''}`)),
      email: String(r.email ?? ''),
    },
    event: {
      organization: String(e.organization ?? ''),
      type: String(e.type ?? ''),
      eventTitle: String(e.eventTitle ?? ''),
      eventSubtitle: String(e.eventSubtitle ?? ''),
      eventDate: String(e.eventDate ?? ''),
      modality: String(e.modality ?? ''),
      director1: String(e.director1 ?? ''),
      director1Role: String(e.director1Role ?? ''),
      director2: String(e.director2 ?? ''),
      director2Role: String(e.director2Role ?? ''),
    },
  }
  if (!parsed.certificateTitle && parsed.certificateType) {
    parsed.certificateTitle = ATTENDANCE_CERT_TITLES[parsed.certificateType]
  }
  if (!parsed.certificateLabel && parsed.certificateType) {
    parsed.certificateLabel = ATTENDANCE_CERT_LABELS[parsed.certificateType]
  }
  return parsed
}

function parseRecipient(raw: unknown): AttendanceCertificateData['recipient'] | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const firstName = normalizeSpanishText(String(r.firstName ?? ''))
  const lastName = normalizeSpanishText(String(r.lastName ?? ''))
  const fullName = normalizeSpanishText(String(r.fullName ?? `${firstName} ${lastName}`))
  if (!fullName) return null
  return {
    firstName,
    lastName,
    fullName,
    email: String(r.email ?? ''),
  }
}

function parseStatusResult(data: unknown): AttendanceStatusResult | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const status = o.status
  if (status !== 'OK' && status !== 'NOT_FOUND') return null
  const viewingCertificate = parseCertificate(o.viewingCertificate)
  const examCertificate = parseCertificate(o.examCertificate)
  const recipient = parseRecipient(o.recipient)
    ?? viewingCertificate?.recipient
    ?? examCertificate?.recipient
    ?? undefined
  return {
    status,
    message: typeof o.message === 'string' ? o.message : undefined,
    watchedOver80: o.watchedOver80 === true,
    canClaimViewing: o.canClaimViewing === true,
    canTakeExam: o.canTakeExam === true,
    canOnlyTakeExam: o.canOnlyTakeExam === true,
    recipient,
    viewingCertificate,
    examCertificate,
  }
}

function parseClaimResult(data: unknown): AttendanceClaimResult | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const status = o.status
  if (
    status !== 'NOT_FOUND' &&
    status !== 'NOT_ELIGIBLE' &&
    status !== 'ALREADY_ISSUED' &&
    status !== 'CERTIFICATE_ISSUED'
  ) return null
  const certificateType = o.certificateType === 'LIVE_VIEWING' || o.certificateType === 'EXAM'
    ? o.certificateType
    : undefined
  return {
    status,
    message: typeof o.message === 'string' ? o.message : '',
    certificateType,
    certificate: parseCertificate(o.certificate),
  }
}

function parseExam(data: unknown): AttendanceExam | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const id = typeof o.id === 'string' ? o.id : ''
  if (!id) return null
  const questionsRaw = o.questions
  if (!Array.isArray(questionsRaw)) return null
  const questions: AttendanceExamQuestion[] = []
  for (const item of questionsRaw) {
    if (!item || typeof item !== 'object') continue
    const q = item as Record<string, unknown>
    const qid = typeof q.id === 'string' ? q.id : ''
    const text = typeof q.text === 'string' ? q.text : ''
    if (!qid || !text) continue
    const optionsRaw = q.options
    if (!Array.isArray(optionsRaw)) continue
    const options: AttendanceExamOption[] = []
    for (const opt of optionsRaw) {
      if (!opt || typeof opt !== 'object') continue
      const op = opt as Record<string, unknown>
      const oid = typeof op.id === 'string' ? op.id : ''
      const otext = typeof op.text === 'string' ? op.text : ''
      if (oid && otext) options.push({ id: oid, text: otext })
    }
    if (options.length < 2) continue
    questions.push({
      id: qid,
      text,
      order: typeof q.order === 'number' ? q.order : undefined,
      options,
    })
  }
  if (questions.length === 0) return null
  return {
    id,
    title: typeof o.title === 'string' ? o.title : 'Examen',
    passingScore: typeof o.passingScore === 'number' ? o.passingScore : undefined,
    questions,
  }
}

function parseSubmitResult(data: unknown): AttendanceExamSubmitResult | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const status = o.status
  if (status !== 'FAILED' && status !== 'CERTIFICATE_ISSUED') return null
  const passed = o.passed === true || status === 'CERTIFICATE_ISSUED'
  return {
    status,
    message: typeof o.message === 'string' ? o.message : '',
    correctas: typeof o.correctas === 'number' ? o.correctas : undefined,
    total: typeof o.total === 'number' ? o.total : undefined,
    nota: typeof o.nota === 'number' ? o.nota : undefined,
    notaMaxima: typeof o.notaMaxima === 'number' ? o.notaMaxima : undefined,
    notaAprobacion: typeof o.notaAprobacion === 'number' ? o.notaAprobacion : undefined,
    passed,
    canTakeExam: typeof o.canTakeExam === 'boolean' ? o.canTakeExam : undefined,
    certificate: parseCertificate(o.certificate) ?? parseCertificate(o.examCertificate),
  }
}

function parseVerifyResult(data: unknown): AttendanceVerifyResult {
  if (!data || typeof data !== 'object') return { valid: false }
  const o = data as Record<string, unknown>
  if (o.valid !== true) return { valid: false }
  const certificateType = typeof o.certificateType === 'string'
    ? o.certificateType
    : typeof o.type === 'string'
      ? o.type
      : undefined
  const recipientRaw = o.recipient
  let recipient: AttendanceVerifyResult['recipient']
  if (recipientRaw && typeof recipientRaw === 'object') {
    const r = recipientRaw as Record<string, unknown>
    recipient = {
      firstName: String(r.firstName ?? ''),
      lastName: String(r.lastName ?? ''),
      fullName: String(r.fullName ?? `${r.firstName ?? ''} ${r.lastName ?? ''}`).trim(),
      email: String(r.email ?? ''),
    }
  }
  let event: AttendanceEventInfo | undefined
  if (o.event && typeof o.event === 'object') {
    const e = o.event as Record<string, unknown>
    event = {
      organization: String(e.organization ?? ''),
      type: String(e.type ?? ''),
      eventTitle: String(e.eventTitle ?? ''),
      eventSubtitle: String(e.eventSubtitle ?? ''),
      eventDate: String(e.eventDate ?? ''),
      modality: String(e.modality ?? ''),
      director1: String(e.director1 ?? ''),
      director1Role: String(e.director1Role ?? ''),
      director2: String(e.director2 ?? ''),
      director2Role: String(e.director2Role ?? ''),
    }
  }
  return {
    valid: true,
    certificateType,
    certificateTitle: typeof o.certificateTitle === 'string'
      ? o.certificateTitle
      : certificateType === 'EXAM'
        ? ATTENDANCE_CERT_TITLES.EXAM
        : certificateType === 'LIVE_VIEWING'
          ? ATTENDANCE_CERT_TITLES.LIVE_VIEWING
          : undefined,
    certificateLabel: typeof o.certificateLabel === 'string'
      ? o.certificateLabel
      : certificateType === 'EXAM'
        ? ATTENDANCE_CERT_LABELS.EXAM
        : certificateType === 'LIVE_VIEWING'
          ? ATTENDANCE_CERT_LABELS.LIVE_VIEWING
          : undefined,
    certificateCode: typeof o.certificateCode === 'string' ? o.certificateCode : undefined,
    issuedAt: typeof o.issuedAt === 'string' ? o.issuedAt : undefined,
    recipient,
    event,
  }
}

async function readError(res: Response, data: unknown): Promise<string> {
  if (data && typeof data === 'object' && typeof (data as { message?: unknown }).message === 'string') {
    return (data as { message: string }).message
  }
  return res.ok ? 'Respuesta inválida del servidor' : 'Error del servidor'
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function fetchAttendanceStatus(email: string): Promise<AttendanceStatusResult> {
  const normalized = normalizeEmail(email)
  const res = await fetch(`${ATTENDANCE_API}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalized }),
    cache: 'no-store',
  })
  const data = await res.json().catch(() => null)
  const parsed = parseStatusResult(data)
  if (parsed) return parsed
  throw new Error(await readError(res, data))
}

export async function claimViewingCertificate(email: string): Promise<AttendanceClaimResult> {
  const normalized = normalizeEmail(email)
  const res = await fetch(`${ATTENDANCE_API}/claim/viewing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalized }),
  })
  const data = await res.json().catch(() => null)
  const parsed = parseClaimResult(data)
  if (parsed) return parsed
  throw new Error(await readError(res, data))
}

export async function claimExamCertificate(email: string): Promise<AttendanceClaimResult> {
  const normalized = normalizeEmail(email)
  const res = await fetch(`${ATTENDANCE_API}/claim/exam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalized }),
  })
  const data = await res.json().catch(() => null)
  const parsed = parseClaimResult(data)
  if (parsed) return parsed
  throw new Error(await readError(res, data))
}

export async function fetchAttendanceExam(email: string): Promise<AttendanceExam> {
  const normalized = normalizeEmail(email)
  const res = await fetch(`${ATTENDANCE_API}/exam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalized }),
  })
  const data = await res.json().catch(() => null)
  const parsed = parseExam(data)
  if (parsed) return parsed
  throw new Error(await readError(res, data))
}

export async function submitAttendanceExam(
  email: string,
  answers: AttendanceExamAnswer[],
): Promise<AttendanceExamSubmitResult> {
  const normalized = normalizeEmail(email)
  const res = await fetch(`${ATTENDANCE_API}/exam/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalized, answers }),
  })
  const data = await res.json().catch(() => null)
  const parsed = parseSubmitResult(data)
  if (parsed) return parsed
  throw new Error(await readError(res, data))
}

export async function verifyAttendanceCertificate(code: string): Promise<AttendanceVerifyResult> {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return { valid: false }
  const res = await fetch(`${ATTENDANCE_API}/verify/${encodeURIComponent(normalized)}`)
  const data = await res.json().catch(() => null)
  return parseVerifyResult(data)
}
