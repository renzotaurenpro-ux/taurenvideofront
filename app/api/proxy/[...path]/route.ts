import { NextRequest } from 'next/server'
import { PRODUCTION_BACKEND_URL } from '@/lib/backend-url'

export const runtime = 'nodejs'

function configuredBackendUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    PRODUCTION_BACKEND_URL
  ).replace(/\/+$/, '')
}

function candidateBases() {
  const primary = configuredBackendUrl()
  if (primary === PRODUCTION_BACKEND_URL) return [primary]
  return [primary, PRODUCTION_BACKEND_URL]
}

function buildTargetUrl(base: string, req: NextRequest, pathParts: string[]) {
  const joined = pathParts.map(encodeURIComponent).join('/')
  const url = new URL(`${base}/${joined}`)
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v))
  return url
}

async function proxyOnce(req: NextRequest, url: URL, body: ArrayBuffer | undefined) {
  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.delete('content-length')

  return fetch(url, {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  })
}

async function handler(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params
  const pathParts = Array.isArray(path) ? path : [String(path)]
  const method = req.method.toUpperCase()
  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer()

  let lastRes: Response | null = null
  let lastUrl: URL | null = null

  for (const base of candidateBases()) {
    const url = buildTargetUrl(base, req, pathParts)
    lastUrl = url
    try {
      const res = await proxyOnce(req, url, body)
      lastRes = res
      if (res.status !== 404 && res.status !== 502 && res.status !== 503) {
        break
      }
    } catch {
      continue
    }
  }

  if (!lastRes || !lastUrl) {
    return new Response(JSON.stringify({ message: 'Backend no disponible' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const outHeaders = new Headers(lastRes.headers)
  outHeaders.delete('content-encoding')
  outHeaders.delete('transfer-encoding')
  outHeaders.delete('connection')
  outHeaders.delete('content-length')

  const responseBuffer = await lastRes.arrayBuffer()

  if (lastRes.status >= 400) {
    const text = new TextDecoder().decode(responseBuffer)
    console.error(`[proxy] ${method} ${lastUrl.pathname} → ${lastRes.status}`)
    console.error(`[proxy] backend response:`, text.slice(0, 1000))
  }

  return new Response(responseBuffer, { status: lastRes.status, headers: outHeaders })
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS }
