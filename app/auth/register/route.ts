import { NextResponse } from 'next/server'
import { createUser, publicUser } from '@/lib/authStore'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const firstName = typeof body?.firstName === 'string' ? body.firstName : ''
  const lastName = typeof body?.lastName === 'string' ? body.lastName : ''
  const rut = typeof body?.rut === 'string' ? body.rut : undefined
  const workplace = typeof body?.workplace === 'string' ? body.workplace : ''
  const medicalArea = typeof body?.medicalArea === 'string' ? body.medicalArea : ''
  const phoneNumber = typeof body?.phoneNumber === 'string' ? body.phoneNumber : ''
  const city = typeof body?.city === 'string' ? body.city : ''

  if (!email || !password || !firstName || !lastName || !workplace || !medicalArea || !phoneNumber || !city) {
    return NextResponse.json({ message: 'INVALID_REQUEST' }, { status: 400 })
  }

  try {
    const user = createUser({ email, password, firstName, lastName, rut, workplace, medicalArea, phoneNumber, city })
    return NextResponse.json(publicUser(user), { status: 200 })
  } catch (e: any) {
    if (e?.code === 'EMAIL_EXISTS') {
      return NextResponse.json({ message: 'EMAIL_EXISTS' }, { status: 409 })
    }
    return NextResponse.json({ message: 'SERVER_ERROR' }, { status: 500 })
  }
}

