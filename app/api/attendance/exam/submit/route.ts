import { NextRequest, NextResponse } from 'next/server'
import { forwardAttendance } from '@/lib/attendance-proxy'
import { mockSubmitAttendanceExam } from '@/lib/attendance-mock'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.text()
  let parsed: { email?: string; answers?: unknown }
  try {
    parsed = JSON.parse(body) as { email?: string; answers?: unknown }
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
  }

  const email = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : ''
  if (!email) {
    return NextResponse.json({ message: 'email es requerido' }, { status: 400 })
  }
  if (!Array.isArray(parsed.answers)) {
    return NextResponse.json({ message: 'answers es requerido' }, { status: 400 })
  }

  const res = await forwardAttendance('exam/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!res) {
    if (process.env.NODE_ENV === 'development') {
      try {
        return NextResponse.json(
          mockSubmitAttendanceExam(email, parsed.answers as { questionId: string; optionId: string }[]),
        )
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'No se pudo enviar el examen'
        return NextResponse.json({ message: msg }, { status: 400 })
      }
    }
    return NextResponse.json({ message: 'Servicio no disponible' }, { status: 503 })
  }

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  })
}
