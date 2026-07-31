import { fetchAuth } from './api'

const KEY_EXAMS = '__scai_exams_v3'

function cacheClear() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY_EXAMS)
  } catch {}
}

function pickId(item: Record<string, unknown>): string {
  return String(item.id ?? item.examId ?? item.uuid ?? '')
}

function normalizeOption(o: Record<string, unknown>, qi: number, oi: number) {
  const text = String(o.text ?? o.label ?? o.option ?? o.content ?? o.value ?? '').trim()
  if (!text) return null
  return {
    id: String(o.id ?? o.optionId ?? o.uuid ?? `opt-${qi}-${oi}`),
    text,
  }
}

function normalizeQuestion(q: Record<string, unknown>, qi: number): ExamQuestion | null {
  const text = String(q.text ?? q.statement ?? q.pregunta ?? q.question ?? q.title ?? '').trim()
  if (!text) return null
  const optsRaw = q.options ?? q.opciones ?? q.answers ?? q.choices ?? []
  if (!Array.isArray(optsRaw)) return null
  const options = optsRaw
    .map((o, oi) => normalizeOption(o as Record<string, unknown>, qi, oi))
    .filter((o): o is ExamQuestionOption => o !== null)
  if (options.length < 2) return null
  return {
    id: String(q.id ?? q.questionId ?? q.uuid ?? `q-${qi}`),
    text,
    order: typeof q.order === 'number' ? q.order : qi + 1,
    options,
  }
}

function normalizeCertificate(raw: unknown): Certificate | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = String(o.id ?? '')
  const certificateCode = typeof o.certificateCode === 'string' ? o.certificateCode : undefined
  if (!id && !certificateCode) return null
  const examRaw = o.exam
  let exam: Certificate['exam']
  if (examRaw && typeof examRaw === 'object') {
    const e = examRaw as Record<string, unknown>
    exam = {
      title: typeof e.title === 'string' ? e.title : undefined,
      courseId: typeof e.courseId === 'string' ? e.courseId : null,
      videoId: typeof e.videoId === 'string' ? e.videoId : null,
    }
  }
  return {
    id: id || certificateCode || '',
    certificateCode,
    issuedAt: typeof o.issuedAt === 'string' ? o.issuedAt : undefined,
    examId: typeof o.examId === 'string' ? o.examId : undefined,
    exam,
  }
}

function normalizeAttempt(raw: unknown): ExamAttempt | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = String(o.id ?? '')
  if (!id) return null
  return {
    id,
    score: typeof o.score === 'number' ? o.score : undefined,
    passed: o.passed === true,
    submittedAt: typeof o.submittedAt === 'string' ? o.submittedAt : undefined,
  }
}

export function normalizeExam(raw: unknown): Exam | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const id = pickId(obj)
  if (!id) return null
  const questionsRaw = obj.questions ?? obj.preguntas ?? obj.items ?? []
  const questions = Array.isArray(questionsRaw)
    ? questionsRaw
        .map((q, i) => normalizeQuestion(q as Record<string, unknown>, i))
        .filter((q): q is ExamQuestion => q !== null)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : []
  return {
    id,
    courseId: typeof obj.courseId === 'string' ? obj.courseId : undefined,
    title: typeof obj.title === 'string' ? obj.title : undefined,
    name: typeof obj.name === 'string' ? obj.name : undefined,
    passingScore: typeof obj.passingScore === 'number' ? obj.passingScore : undefined,
    published: obj.published !== false,
    passed: obj.passed === true,
    canTakeExam: typeof obj.canTakeExam === 'boolean' ? obj.canTakeExam : obj.passed !== true,
    lastAttempt: normalizeAttempt(obj.lastAttempt),
    certificate: normalizeCertificate(obj.certificate),
    questions,
  }
}

export type ExamQuestionOption = {
  id: string
  text: string
}

export type ExamQuestion = {
  id: string
  text: string
  order?: number
  options: ExamQuestionOption[]
}

export type ExamAttempt = {
  id: string
  score?: number
  passed: boolean
  submittedAt?: string
}

export type Certificate = {
  id: string
  certificateCode?: string
  issuedAt?: string
  examId?: string
  user?: { firstName: string; lastName: string; email: string }
  exam?: { title?: string; videoId?: string | null; courseId?: string | null }
}

export type Exam = {
  id: string
  courseId?: string
  title?: string
  name?: string
  passingScore?: number
  published: boolean
  canTakeExam: boolean
  passed: boolean
  lastAttempt: ExamAttempt | null
  certificate: Certificate | null
  questions: ExamQuestion[]
}

export type ExamListItem = Exam

export type ExamStatus = {
  examId: string
  title?: string
  courseId?: string
  canTakeExam: boolean
  passed: boolean
  lastAttempt: ExamAttempt | null
  certificate: Certificate | null
}

export type ExamSubmitAnswer = { questionId: string; optionId: string }

export type ExamSubmitResult = {
  attemptId?: string
  correctas?: number
  total?: number
  score?: number
  nota?: number
  notaMaxima?: number
  notaAprobacion?: number
  passed: boolean
  canTakeExam?: boolean
  certificate?: Certificate | null
}

function parseExamsList(data: unknown): ExamListItem[] {
  const arr = Array.isArray(data)
    ? data
    : Array.isArray((data as { data?: unknown })?.data)
      ? (data as { data: unknown[] }).data
      : []
  const out: ExamListItem[] = []
  for (const item of arr) {
    const full = normalizeExam(item)
    if (full) out.push(full)
  }
  return out
}

export function clearExamsCache() {
  cacheClear()
}

export async function fetchExams(): Promise<ExamListItem[]> {
  const res = await fetchAuth('/exams')
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  return parseExamsList(data)
}

export async function fetchExamById(id: string): Promise<Exam | null> {
  const list = await fetchExams()
  return list.find(e => e.id === id) ?? null
}

export async function fetchPublishedExam(): Promise<Exam | null> {
  const list = await fetchExams()
  return list.find(e => e.published !== false) ?? list[0] ?? null
}

export async function fetchExamStatus(id: string): Promise<ExamStatus | null> {
  const res = await fetchAuth(`/exams/${encodeURIComponent(id)}/status`)
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const examId = String(o.examId ?? o.id ?? id)
  if (!examId) return null
  return {
    examId,
    title: typeof o.title === 'string' ? o.title : undefined,
    courseId: typeof o.courseId === 'string' ? o.courseId : undefined,
    passed: o.passed === true,
    canTakeExam: typeof o.canTakeExam === 'boolean' ? o.canTakeExam : o.passed !== true,
    lastAttempt: normalizeAttempt(o.lastAttempt),
    certificate: normalizeCertificate(o.certificate),
  }
}

function parseSubmitPayload(data: unknown): ExamSubmitResult | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  return {
    attemptId: typeof o.attemptId === 'string' ? o.attemptId : undefined,
    correctas: typeof o.correctas === 'number' ? o.correctas : undefined,
    total: typeof o.total === 'number' ? o.total : undefined,
    score: typeof o.score === 'number' ? o.score : undefined,
    nota: typeof o.nota === 'number' ? o.nota : undefined,
    notaMaxima: typeof o.notaMaxima === 'number' ? o.notaMaxima : undefined,
    notaAprobacion: typeof o.notaAprobacion === 'number' ? o.notaAprobacion : undefined,
    passed: o.passed === true,
    canTakeExam: typeof o.canTakeExam === 'boolean' ? o.canTakeExam : undefined,
    certificate: normalizeCertificate(o.certificate),
  }
}

export async function submitExam(id: string, answers: ExamSubmitAnswer[]): Promise<ExamSubmitResult | null> {
  const res = await fetchAuth(`/exams/${encodeURIComponent(id)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
  const data = await res.json().catch(() => null)

  if (res.ok) {
    const parsed = parseSubmitPayload(data)
    if (parsed) clearExamsCache()
    return parsed
  }

  if (res.status === 400 && data && typeof data === 'object') {
    const nested = (data as { message?: unknown }).message
    if (nested && typeof nested === 'object') {
      const m = nested as Record<string, unknown>
      if (m.passed === true || m.canTakeExam === false) {
        clearExamsCache()
        return {
          passed: true,
          canTakeExam: false,
          certificate: normalizeCertificate(m.certificate),
        }
      }
    }
  }

  return null
}

export async function issueCertificate(examId: string): Promise<Certificate | null> {
  const res = await fetchAuth('/certificates/issue', {
    method: 'POST',
    body: JSON.stringify({ examId }),
  })
  if (!res.ok) return null
  return normalizeCertificate(await res.json().catch(() => null))
}

export async function fetchMyCertificates(): Promise<Certificate[]> {
  const res = await fetchAuth('/certificates/my')
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  if (!Array.isArray(data)) return []
  return data.map(normalizeCertificate).filter((c): c is Certificate => c !== null)
}

export function examHasCertificateAccess(exam: Pick<Exam, 'passed' | 'canTakeExam' | 'certificate'> | null | undefined): boolean {
  if (!exam) return false
  return exam.passed === true || exam.canTakeExam === false || !!exam.certificate
}

export type CertVerifyResult = {
  valid: boolean
  certificateCode?: string
  issuedAt?: string
  user?: { firstName: string; lastName: string; email: string }
  exam?: { title: string; videoId: string | null }
}

export async function verifyCertificate(code: string): Promise<CertVerifyResult | null> {
  try {
    const { fetchPublic } = await import('./api')
    const res = await fetchPublic(`/certificates/verify/${encodeURIComponent(code)}`)
    if (!res.ok) return { valid: false }
    return await res.json().catch(() => null)
  } catch {
    return null
  }
}
