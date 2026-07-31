import { fetchMyCertificates, resolveCourseExamAccess } from './exams'

export const CERT_PASSED_KEY = '__tauren_cert_passed_v1'

export function setCertPassedLocal(passed: boolean) {
  if (typeof window === 'undefined') return
  try {
    if (passed) sessionStorage.setItem(CERT_PASSED_KEY, '1')
    else sessionStorage.removeItem(CERT_PASSED_KEY)
  } catch {}
}

export function getCertPassedLocal(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(CERT_PASSED_KEY) === '1'
  } catch {
    return false
  }
}

export async function syncCertUnlocked(): Promise<boolean> {
  try {
    const certs = await fetchMyCertificates().catch(() => [])
    if (certs.length > 0) {
      setCertPassedLocal(true)
      return true
    }
    const access = await resolveCourseExamAccess()
    if (access.passed || access.certificate) {
      setCertPassedLocal(true)
      return true
    }
    setCertPassedLocal(false)
    return false
  } catch {
    return getCertPassedLocal()
  }
}
