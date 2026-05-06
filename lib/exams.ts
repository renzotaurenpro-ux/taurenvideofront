import { fetchAuth } from './api'

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
  const res = await fetchAuth('/exams')
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  return Array.isArray(data) ? data : []
}

export async function fetchExamById(id: string): Promise<Exam | null> {
  const res = await fetchAuth(`/exams/${id}`)
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  if (!data || typeof data !== 'object') return null
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

