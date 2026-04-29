import { randomUUID, createHash } from 'crypto'

export type Role = 'USER'

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  rut?: string
  workplace: string
  medicalArea: string
  phoneNumber: string
  city: string
  role: Role
  firebaseUid: string
  createdAt: string
  passwordHash: string
}

type Store = {
  usersById: Map<string, User>
  usersByEmail: Map<string, User>
  usersByFirebaseUid: Map<string, User>
}

declare global {
  // eslint-disable-next-line no-var
  var __TAUREN_AUTH_STORE__: Store | undefined
}

function getStore(): Store {
  if (!globalThis.__TAUREN_AUTH_STORE__) {
    globalThis.__TAUREN_AUTH_STORE__ = {
      usersById: new Map(),
      usersByEmail: new Map(),
      usersByFirebaseUid: new Map(),
    }
  }
  return globalThis.__TAUREN_AUTH_STORE__
}

export function hashPassword(password: string) {
  return createHash('sha256').update(password, 'utf8').digest('hex')
}

export function makeFirebaseUid(email: string) {
  return `firebase:${email.toLowerCase().trim()}`
}

export function createUser(params: {
  email: string
  password: string
  firstName: string
  lastName: string
  rut?: string
  workplace: string
  medicalArea: string
  phoneNumber: string
  city: string
}) {
  const store = getStore()
  const email = params.email.toLowerCase().trim()
  if (store.usersByEmail.has(email)) {
    const err = new Error('EMAIL_EXISTS')
    ;(err as any).code = 'EMAIL_EXISTS'
    throw err
  }

  const now = new Date().toISOString()
  const user: User = {
    id: randomUUID(),
    email,
    firstName: params.firstName.trim(),
    lastName: params.lastName.trim(),
    rut: params.rut ? params.rut.trim() : undefined,
    workplace: params.workplace.trim(),
    medicalArea: params.medicalArea.trim(),
    phoneNumber: params.phoneNumber.trim(),
    city: params.city.trim(),
    role: 'USER',
    firebaseUid: makeFirebaseUid(email),
    createdAt: now,
    passwordHash: hashPassword(params.password),
  }

  store.usersById.set(user.id, user)
  store.usersByEmail.set(user.email, user)
  store.usersByFirebaseUid.set(user.firebaseUid, user)
  return user
}

export function getUserByFirebaseUid(firebaseUid: string) {
  const store = getStore()
  return store.usersByFirebaseUid.get(firebaseUid) || null
}

export function updateUserProfile(
  firebaseUid: string,
  patch: Partial<Pick<User, 'firstName' | 'lastName' | 'rut' | 'workplace' | 'medicalArea' | 'phoneNumber' | 'city'>>
) {
  const store = getStore()
  const u = store.usersByFirebaseUid.get(firebaseUid)
  if (!u) return null
  const next: User = {
    ...u,
    firstName: typeof patch.firstName === 'string' ? patch.firstName.trim() : u.firstName,
    lastName: typeof patch.lastName === 'string' ? patch.lastName.trim() : u.lastName,
    rut: typeof patch.rut === 'string' ? patch.rut.trim() : u.rut,
    workplace: typeof patch.workplace === 'string' ? patch.workplace.trim() : u.workplace,
    medicalArea: typeof patch.medicalArea === 'string' ? patch.medicalArea.trim() : u.medicalArea,
    phoneNumber: typeof patch.phoneNumber === 'string' ? patch.phoneNumber.trim() : u.phoneNumber,
    city: typeof patch.city === 'string' ? patch.city.trim() : u.city,
  }
  store.usersById.set(next.id, next)
  store.usersByEmail.set(next.email, next)
  store.usersByFirebaseUid.set(next.firebaseUid, next)
  return next
}

export function deleteUser(firebaseUid: string) {
  const store = getStore()
  const u = store.usersByFirebaseUid.get(firebaseUid)
  if (!u) return false
  store.usersByFirebaseUid.delete(u.firebaseUid)
  store.usersByEmail.delete(u.email)
  store.usersById.delete(u.id)
  return true
}

export function publicUser(u: User) {
  const { passwordHash: _pw, ...rest } = u
  return rest
}

