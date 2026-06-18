import { NextRequest, NextResponse } from 'next/server'
import { forwardAttendance } from '@/lib/attendance-proxy'
import { mockClaimAttendance } from '@/lib/attendance-mock'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  let parsed: { email?: string }
  try {
    parsed = JSON.parse(body) as { email?: string }
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
  }

  const email = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ message: 'email es requerido' }, { status: 400 })
  }

  const payload = JSON.stringify({ email })
  const res = await forwardAttendance('claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  })

  if (!res) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(mockClaimAttendance(email))
    }
    return NextResponse.json({ message: 'Servicio no disponible' }, { status: 503 })
  }

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  })
}
