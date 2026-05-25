import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

function backendUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'http://localhost:3001'
  ).replace(/\/+$/, '')
}

function buildTargetUrl(req: NextRequest, pathParts: string[]) {
  const base = backendUrl()
  const joined = pathParts.map(encodeURIComponent).join('/')
  const url = new URL(`${base}/${joined}`)
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v))
  return url
}

async function handler(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params
  const url = buildTargetUrl(req, Array.isArray(path) ? path : [String(path)])

  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.delete('content-length')

  const method = req.method.toUpperCase()
  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer()

  const res = await fetch(url, {
    method,
    headers,
    body,
    redirect: 'manual',
  })

  const outHeaders = new Headers(res.headers)
  outHeaders.delete('content-encoding')
  outHeaders.delete('transfer-encoding')
  outHeaders.delete('connection')

  const responseBuffer = await res.arrayBuffer()

  if (res.status >= 400) {
    const text = new TextDecoder().decode(responseBuffer)
    console.error(`[proxy] ${method} ${url.pathname} → ${res.status}`)
    console.error(`[proxy] backend response:`, text.slice(0, 1000))
  }

  return new Response(responseBuffer, { status: res.status, headers: outHeaders })
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS }

