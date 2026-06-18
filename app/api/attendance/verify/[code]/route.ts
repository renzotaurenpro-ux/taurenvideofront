import { NextRequest, NextResponse } from 'next/server'
import { forwardAttendance } from '@/lib/attendance-proxy'
import { mockVerifyAttendance } from '@/lib/attendance-mock'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const normalized = code.trim().toUpperCase()
  if (!normalized) {
    return NextResponse.json({ valid: false })
  }

  const res = await forwardAttendance(`verify/${encodeURIComponent(normalized)}`, {
    method: 'GET',
  })

  if (!res) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(mockVerifyAttendance(normalized))
    }
    return NextResponse.json({ valid: false })
  }

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  })
}
