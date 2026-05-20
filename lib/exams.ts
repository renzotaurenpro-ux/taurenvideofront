import { fetchAuth } from './api'

const TTL_EXAMS = 10 * 60 * 1000
const KEY_EXAMS = '__scai_exams_v2'
const KEY_EXAM = (id: string) => `__scai_exam_v2_${id}`

function cacheGet<T>(key: string, ttl: number): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > ttl) return null
    return data as T
  } catch {
    return null
  }
}

function cacheSet(key: string, data: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

function cacheDrop(key: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
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
    options,
  }
}

export function normalizeExam(raw: unknown): Exam | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const id = pickId(obj)
  if (!id) return null
  const questionsRaw = obj.questions ?? obj.preguntas ?? obj.items ?? []
  if (!Array.isArray(questionsRaw)) return null
  const questions = questionsRaw
    .map((q, i) => normalizeQuestion(q as Record<string, unknown>, i))
    .filter((q): q is ExamQuestion => q !== null)
  if (questions.length === 0) return null
  return {
    id,
    title: typeof obj.title === 'string' ? obj.title : undefined,
    name: typeof obj.name === 'string' ? obj.name : undefined,
    questions,
  }
}

export type ExamListItem = {
  id: string
  title?: string
  name?: string
  published?: boolean
  questions?: ExamQuestion[]
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
  exam?: { title: string; videoId?: string | null; courseId?: string | null }
}

function parseExamsList(data: unknown): ExamListItem[] {
  const arr = Array.isArray(data) ? data : Array.isArray((data as { data?: unknown })?.data) ? (data as { data: unknown[] }).data : []
  const out: ExamListItem[] = []
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = pickId(o)
    if (!id) continue
    const full = normalizeExam(o)
    out.push({
      id,
      title: typeof o.title === 'string' ? o.title : undefined,
      name: typeof o.name === 'string' ? o.name : undefined,
      published: o.published !== false,
      questions: full?.questions,
    })
  }
  return out
}

export async function fetchExams(): Promise<ExamListItem[]> {
  const cached = cacheGet<ExamListItem[]>(KEY_EXAMS, TTL_EXAMS)
  if (cached?.length) {
    fetchAuth('/exams')
      .then(async r => {
        if (!r.ok) return
        const data = await r.json().catch(() => null)
        const list = parseExamsList(data)
        if (list.length) cacheSet(KEY_EXAMS, list)
      })
      .catch(() => {})
    return cached
  }
  const res = await fetchAuth('/exams')
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  const list = parseExamsList(data)
  if (list.length) cacheSet(KEY_EXAMS, list)
  return list
}

async function requestExamById(id: string): Promise<Exam | null> {
  const paths = [`/exams/${encodeURIComponent(id)}`, `/exams/${encodeURIComponent(id)}/take`]
  let lastStatus = 0
  for (const path of paths) {
    const res = await fetchAuth(path)
    lastStatus = res.status
    if (res.status === 404) continue
    if (!res.ok) continue
    const data = await res.json().catch(() => null)
    const nested = data && typeof data === 'object' ? (data as { exam?: unknown }).exam ?? data : data
    const exam = normalizeExam(nested)
    if (exam) return exam
  }
  if (lastStatus === 404) cacheDrop(KEY_EXAM(id))
  return null
}

export async function fetchExamById(id: string): Promise<Exam | null> {
  const key = KEY_EXAM(id)
  const cached = cacheGet<Exam>(key, TTL_EXAMS)
  const cachedOk = cached ? normalizeExam(cached) : null
  if (cachedOk) {
    requestExamById(id)
      .then(fresh => {
        if (fresh) cacheSet(key, fresh)
      })
      .catch(() => {})
    return cachedOk
  }
  if (cached) cacheDrop(key)
  const fresh = await requestExamById(id)
  if (fresh) cacheSet(key, fresh)
  return fresh
}

export async function fetchPublishedExam(): Promise<Exam | null> {
  const list = await fetchExams()
  const picked = list.find(e => e.published !== false) ?? list[0]
  if (!picked?.id) return null
  if (picked.questions?.length) {
    const inline = normalizeExam(picked)
    if (inline) return inline
  }
  return fetchExamById(picked.id)
}

export async function submitExam(id: string, answers: ExamSubmitAnswer[]): Promise<ExamSubmitResult | null> {
  const res = await fetchAuth(`/exams/${encodeURIComponent(id)}/submit`, {
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
