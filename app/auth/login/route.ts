import { NextResponse } from 'next/server'
import { getUserByFirebaseUid } from '@/lib/authStore'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const idToken = typeof body?.idToken === 'string' ? body.idToken : ''
  if (!idToken) return NextResponse.json({ message: 'INVALID_REQUEST' }, { status: 400 })

  const user = getUserByFirebaseUid(idToken)
  if (!user) return NextResponse.json({ message: 'USER_NOT_FOUND' }, { status: 404 })

  return NextResponse.json(
    {
      token: idToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        rut: user.rut,
        workplace: user.workplace,
        medicalArea: user.medicalArea,
        phoneNumber: user.phoneNumber,
        city: user.city,
        role: user.role,
        firebaseUid: user.firebaseUid,
      },
    },
    { status: 200 }
  )
}

