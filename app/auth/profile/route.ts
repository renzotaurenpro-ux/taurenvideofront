import { NextResponse } from 'next/server'
import { deleteUser, getUserByFirebaseUid, publicUser, updateUserProfile } from '@/lib/authStore'

function bearer(req: Request) {
  const h = req.headers.get('authorization') || req.headers.get('Authorization') || ''
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m?.[1]?.trim() || ''
}

export async function GET(req: Request) {
  const token = bearer(req)
  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 })
  const user = getUserByFirebaseUid(token)
  if (!user) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 })
  return NextResponse.json(publicUser(user), { status: 200 })
}

export async function PATCH(req: Request) {
  const token = bearer(req)
  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const patch = {
    firstName: typeof body?.firstName === 'string' ? body.firstName : undefined,
    lastName: typeof body?.lastName === 'string' ? body.lastName : undefined,
    rut: typeof body?.rut === 'string' ? body.rut : undefined,
    workplace: typeof body?.workplace === 'string' ? body.workplace : undefined,
    medicalArea: typeof body?.medicalArea === 'string' ? body.medicalArea : undefined,
    phoneNumber: typeof body?.phoneNumber === 'string' ? body.phoneNumber : undefined,
    city: typeof body?.city === 'string' ? body.city : undefined,
  }

  const hasAny =
    patch.firstName !== undefined ||
    patch.lastName !== undefined ||
    patch.rut !== undefined ||
    patch.workplace !== undefined ||
    patch.medicalArea !== undefined ||
    patch.phoneNumber !== undefined ||
    patch.city !== undefined
  if (!hasAny) return NextResponse.json({ message: 'INVALID_REQUEST' }, { status: 400 })

  const updated = updateUserProfile(token, patch)
  if (!updated) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 })

  const u = publicUser(updated) as any
  return NextResponse.json(
    {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      rut: u.rut,
      workplace: u.workplace,
      medicalArea: u.medicalArea,
      phoneNumber: u.phoneNumber,
      city: u.city,
      role: u.role,
      firebaseUid: u.firebaseUid,
    },
    { status: 200 }
  )
}

export async function DELETE(req: Request) {
  const token = bearer(req)
  if (!token) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 })
  const ok = deleteUser(token)
  if (!ok) return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 })
  return NextResponse.json({ message: 'Cuenta eliminada correctamente' }, { status: 200 })
}

