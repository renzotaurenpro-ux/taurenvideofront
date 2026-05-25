import { NextRequest, NextResponse } from 'next/server'

const AUTH_ONLY_PATHS = ['/', '/login', '/registro']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('__tauren_session')

  if (AUTH_ONLY_PATHS.includes(pathname) && session?.value) {
    return NextResponse.redirect(new URL('/ver', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/registro'],
}
