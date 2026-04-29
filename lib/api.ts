import { auth } from './firebase'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

async function getToken(forceRefresh = false): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('UNAUTHENTICATED')
  return user.getIdToken(forceRefresh)
}

export async function fetchAuth(path: string, options: RequestInit = {}): Promise<Response> {
  let token = await getToken()

  const makeHeaders = (t: string) => ({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    Authorization: `Bearer ${t}`,
  })

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers: makeHeaders(token) })

  if (res.status === 401) {
    token = await getToken(true)
    res = await fetch(`${API_BASE}${path}`, { ...options, headers: makeHeaders(token) })
  }

  return res
}

export async function postPublic<T>(path: string, body: T): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
