import { fetchAuth } from './api'

const TTL_EXAMS = 10 * 60 * 1000
const KEY_EXAMS = '__scai_exams_v1'
const KEY_EXAM = (id: string) => `__scai_exam_${id}_v1`

function cacheGet<T>(key: string, ttl: number): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > ttl) return null
    return data as T
  } catch { return null }
}

function cacheSet(key: string, data: unknown) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })) } catch {}
}

export type ExamListItem = {
  id: string
  title?: string
  name?: string
  published?: boolean
}

export type ExamQuestionOption = {
  id: string
  text: string
}

export type ExamQuestion = {
  id: string
  text: string
  options: ExamQuestionOption[]
}

export type Exam = {
  id: string
  title?: string
  name?: string
  questions: ExamQuestion[]
}

export type ExamSubmitAnswer = { questionId: string; optionId: string }

export type ExamSubmitResult = {
  attemptId: string
  correctas: number
  total: number
  nota: number
  notaMaxima: number
  notaAprobacion: number
  passed: boolean
}

export type Certificate = {
  id: string
  certificateCode?: string
  issuedAt?: string
  examId?: string
  user?: { firstName: string; lastName: string; email: string }
  exam?: { title: string; videoId?: string | null }
}

export async function fetchExams(): Promise<ExamListItem[]> {
  const cached = cacheGet<ExamListItem[]>(KEY_EXAMS, TTL_EXAMS)
  if (cached) {
    fetchAuth('/exams').then(r => r.ok && r.json().then((d: unknown) => Array.isArray(d) && cacheSet(KEY_EXAMS, d))).catch(() => {})
    return cached
  }
  const res = await fetchAuth('/exams')
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  const list: ExamListItem[] = Array.isArray(data) ? data : []
  cacheSet(KEY_EXAMS, list)
  return list
}

export async function fetchExamById(id: string): Promise<Exam | null> {
  const key = KEY_EXAM(id)
  const cached = cacheGet<Exam>(key, TTL_EXAMS)
  if (cached) {
    fetchAuth(`/exams/${id}`).then(r => r.ok && r.json().then((d: unknown) => d && typeof d === 'object' && cacheSet(key, d))).catch(() => {})
    return cached
  }
  const res = await fetchAuth(`/exams/${id}`)
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  if (!data || typeof data !== 'object') return null
  cacheSet(key, data)
  return data as Exam
}

export async function submitExam(id: string, answers: ExamSubmitAnswer[]): Promise<ExamSubmitResult | null> {
  const res = await fetchAuth(`/exams/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) return null
  return await res.json().catch(() => null)
}

export async function issueCertificate(examId: string): Promise<Certificate | null> {
  const res = await fetchAuth('/certificates/issue', {
    method: 'POST',
    body: JSON.stringify({ examId }),
  })
  if (!res.ok) return null
  return await res.json().catch(() => null)
}

export async function fetchMyCertificates(): Promise<Certificate[]> {
  const res = await fetchAuth('/certificates/my')
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  return Array.isArray(data) ? data : []
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

