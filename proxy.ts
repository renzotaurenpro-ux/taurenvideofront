import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/ver', '/carrito', '/payment', '/admin', '/ajustes']
const AUTH_ONLY_PATHS = ['/', '/login', '/registro']
const API_PROXY_PREFIX = '/api/proxy/'
const BACKEND_URL = process.env.API_BASE_URL ?? 'http://localhost:3001'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = request.cookies.get('__tauren_session')

  if (AUTH_ONLY_PATHS.includes(pathname) && session?.value) {
    return NextResponse.redirect(new URL('/ver', request.url))
  }

  if (pathname.startsWith(API_PROXY_PREFIX)) {
    const base = BACKEND_URL.replace(/\/+$/, '')
    const rest = pathname.slice(API_PROXY_PREFIX.length)
    const url = new URL(`${base}/${rest}`)
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.append(k, v))
    return NextResponse.rewrite(url)
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  if (!session?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/registro', '/api/proxy/:path*', '/ver/:path*', '/carrito/:path*', '/payment/:path*', '/admin/:path*', '/ajustes/:path*', '/ajustes'],
}

