'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Home, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, hasFirebaseConfig } from '@/lib/firebase'
import { useAuth } from '@/lib/authContext'
import type { UserProfile } from '@/lib/authContext'
import { registerAuthUser, setSessionCookie, syncAuthLogin, fetchAuthProfile, waitForFirebaseUser } from '@/lib/auth'
import { setCachedPurchase } from '@/lib/api'
import { fetchPublishedCourse, checkCoursePurchase } from '@/lib/courses'
import PageBackground from '@/components/PageBackground'

type FormState = {
  email: string
  password: string
  firstName: string
  lastName: string
  rut: string
  workplace: string
  medicalArea: string
  phoneNumber: string
  city: string
}

const initialState: FormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  rut: '',
  workplace: '',
  medicalArea: '',
  phoneNumber: '',
  city: '',
}

const CIUDADES = [
  'Arica','Iquique','Antofagasta','Calama','Copiapó','La Serena','Coquimbo',
  'Valparaíso','Viña del Mar','Santiago','Rancagua','Talca','Chillán','Concepción',
  'Los Ángeles','Temuco','Valdivia','Osorno','Puerto Montt','Coyhaique','Punta Arenas',
]

const AREAS_MEDICAS = [
  'Alergología e Inmunología','Anestesiología','Cardiología','Cirugía General',
  'Dermatología','Endocrinología','Gastroenterología','Geriatría','Ginecología y Obstetricia',
  'Hematología','Infectología','Medicina de Familia','Medicina de Urgencias',
  'Medicina Interna','Nefrología','Neumología','Neurología','Oftalmología',
  'Oncología','Ortopedia y Traumatología','Otorrinolaringología','Pediatría',
  'Psiquiatría','Radiología','Reumatología','Urología','Otra',
]

const STEPS = [
  { id: 1, label: 'Cuenta' },
  { id: 2, label: 'Personal' },
  { id: 3, label: 'Profesional' },
]

export default function RegistroPage() {
  const router = useRouter()
  const { cacheProfile } = useAuth()
  const [form, setForm] = useState<FormState>(initialState)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (k: keyof FormState, v: string) => setForm(s => ({ ...s, [k]: v }))

  function nextStep(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (step < 3) setStep(s => s + 1)
    else void handleSubmit()
  }

  async function handleSubmit() {
    if (!hasFirebaseConfig() || !auth) {
      setError('Autenticación no configurada en este entorno')
      return
    }
    setLoading(true)
    try {
      const payload = { ...form, ...(form.rut ? {} : { rut: undefined }) }
      await registerAuthUser(payload)

      const credential = await signInWithEmailAndPassword(auth, form.email.trim(), form.password)
      const uid = credential.user.uid
      setSessionCookie(uid)
      await waitForFirebaseUser()
      const idToken = await credential.user.getIdToken()
      let profile: UserProfile | null = await syncAuthLogin(idToken)
      if (!profile) profile = await fetchAuthProfile()
      if (!profile) {
        profile = {
          id: uid,
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: 'USER',
          firebaseUid: uid,
          workplace: form.workplace,
          medicalArea: form.medicalArea,
          phoneNumber: form.phoneNumber,
          city: form.city,
          rut: form.rut || undefined,
        }
      }
      cacheProfile(uid, profile)
      const course = await fetchPublishedCourse()
      if (course) {
        const purchased = await checkCoursePurchase(course.id)
        setCachedPurchase(course.id, purchased)
      }
      setOk(true)
      router.replace('/ver')
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado')
      } else {
        setError(err?.message || 'Error de registro')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputBase =
    'w-full rounded-xl px-4 py-3.5 text-white placeholder:text-white/25 focus:outline-none text-sm transition-colors focus:border-[rgba(18,180,198,0.5)]'
  const selectBase =
    'w-full rounded-xl px-4 py-3.5 text-white focus:outline-none text-sm transition-colors cursor-pointer focus:border-[rgba(18,180,198,0.5)]'
  const fieldStyle = {
    background: 'rgba(11,25,40,0.8)',
    border: '1px solid rgba(18,180,198,0.18)',
  } as const

  return (
    <div className="relative min-h-[100dvh] min-h-screen flex flex-col px-4 py-6 pt-12 overflow-x-hidden">
      <PageBackground scene="registro" />

      <Link
        href="/"
        className="fixed top-[max(1rem,env(safe-area-inset-top,0px)+0.75rem)] left-[max(1rem,env(safe-area-inset-left,0px)+0.75rem)] z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-white/65 hover:text-white/90 border border-white/12 bg-black/20 hover:bg-black/35 backdrop-blur-sm transition-colors"
      >
        <Home size={12} style={{ color: 'var(--scai-teal)' }} />
        Inicio
      </Link>

      <div className="relative mx-auto w-full max-w-lg z-10 flex-1 flex flex-col">
        <div className="flex justify-center mb-5">
          <Image src={ScaiLogo} alt="SCAI" priority className="h-7 w-auto" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-white leading-tight">Crea tu cuenta</h1>
          <p className="text-white/45 text-xs mt-1">Completa tus datos para acceder a las jornadas</p>
        </div>

        <div className="flex items-center justify-center gap-0 mb-7">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                type="button"
                onClick={() => step > s.id && setStep(s.id)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.id
                      ? 'text-white scale-110'
                      : step > s.id
                      ? 'text-white'
                      : 'text-white/30'
                  }`}
                  style={{
                    background: step === s.id
                      ? 'var(--scai-teal)'
                      : step > s.id
                      ? 'rgba(18,180,198,0.35)'
                      : 'rgba(255,255,255,0.07)',
                  }}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-[10px] font-medium ${step === s.id ? 'text-white' : 'text-white/35'}`}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className="w-10 sm:w-16 h-px mx-1 mb-4 transition-all"
                  style={{ background: step > s.id ? 'rgba(18,180,198,0.4)' : 'rgba(255,255,255,0.1)' }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl border overflow-hidden flex-1"
          style={{ background: 'rgba(14,32,53,0.72)', borderColor: 'rgba(18,180,198,0.18)', backdropFilter: 'blur(14px)' }}
        >
          {error && (
            <div className="mx-5 mt-4 rounded-xl border px-4 py-3 text-xs text-red-300 bg-red-500/10 border-red-500/20">
              {error}
            </div>
          )}
          {ok && (
            <div className="mx-5 mt-4 rounded-xl border px-4 py-3 text-xs text-green-300 bg-green-500/10 border-green-500/20 flex items-center gap-2">
              <CheckCircle2 size={14} />
              Registro exitoso. Redirigiendo...
            </div>
          )}

          <form onSubmit={nextStep} className="px-5 py-6 space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    className={inputBase}
                    style={fieldStyle}
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="doctor@hospital.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className={`${inputBase} pr-11`}
                      style={fieldStyle}
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-0.5"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Nombre</label>
                    <input
                      className={inputBase}
                      style={fieldStyle}
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      placeholder="Juan"
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Apellido</label>
                    <input
                      className={inputBase}
                      style={fieldStyle}
                      value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      placeholder="Pérez"
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Teléfono</label>
                  <input
                    className={inputBase}
                    style={fieldStyle}
                    value={form.phoneNumber}
                    onChange={e => set('phoneNumber', e.target.value)}
                    placeholder="+56912345678"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">RUT <span className="text-white/25">(opcional)</span></label>
                  <input
                    className={inputBase}
                    style={fieldStyle}
                    value={form.rut}
                    onChange={e => set('rut', e.target.value)}
                    placeholder="12.345.678-9"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Ciudad</label>
                  <select
                    className={selectBase}
                    style={fieldStyle}
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    required
                  >
                    <option value="">Selecciona ciudad</option>
                    {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Área médica</label>
                  <select
                    className={selectBase}
                    style={fieldStyle}
                    value={form.medicalArea}
                    onChange={e => set('medicalArea', e.target.value)}
                    required
                  >
                    <option value="">Selecciona área</option>
                    {AREAS_MEDICAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Lugar de trabajo</label>
                  <input
                    className={inputBase}
                    style={fieldStyle}
                    value={form.workplace}
                    onChange={e => set('workplace', e.target.value)}
                    placeholder="Clínica / Hospital"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-60"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 28px rgba(18,180,198,0.3)' }}
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {step < 3 ? 'Continuar' : (loading ? 'Creando cuenta...' : 'Crear cuenta')}
              </button>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setError(''); setStep(s => s - 1) }}
                  className="w-full inline-flex items-center justify-center rounded-xl py-3 text-sm font-medium text-white/50 hover:text-white/80 transition-colors border border-white/10"
                >
                  Atrás
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-white/30 text-[11px] mt-4 pb-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--scai-teal)' }} className="hover:brightness-125">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
