'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth, cacheProfileToStorage } from '@/lib/authContext'

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

export default function RegistroPage() {
  const router = useRouter()
  const { setProfile } = useAuth()
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const apiBase = useMemo(() => '/api/proxy', [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOk(false)
    setLoading(true)
    try {
      const payload = { ...form, ...(form.rut ? {} : { rut: undefined }) }
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(typeof data?.message === 'string' ? data.message : 'No se pudo completar el registro')
      }

      const credential = await signInWithEmailAndPassword(auth, form.email, form.password)
      const idToken = await credential.user.getIdToken()

      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `__tauren_session=${credential.user.uid}; path=/; max-age=86400; SameSite=Lax${secure}`

      fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
        .then(r => (r.ok ? r.json() : null))
        .then(d => {
          if (!d) return
          const p = d.user ?? d
          setProfile(p)
          cacheProfileToStorage(credential.user.uid, p)
        })
        .catch(() => {})

      setOk(true)
      setTimeout(() => router.push('/ver'), 300)
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

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none text-base border border-input bg-background transition-shadow focus:ring-2 focus:ring-ring/30'
  const selectClass =
    'w-full rounded-xl px-4 py-3 text-foreground focus:outline-none text-base border border-input bg-background transition-shadow focus:ring-2 focus:ring-ring/30 cursor-pointer'

  return (
    <div className="min-h-screen px-4 py-10 sm:py-12 bg-gradient-to-br from-background via-secondary to-background">
      <div className="mx-auto w-full max-w-4xl">

        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={15} />
            Volver
          </Link>
          <Image src={ScaiLogo} alt="SCAI" priority className="h-8 w-auto" />
        </div>

        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="px-6 sm:px-10 py-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--scai-teal)' }}>
                Registro de doctores
              </p>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-black leading-tight">
                Crea tu cuenta
              </h1>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                Completa tus datos y continúa al carrito para comprar el acceso.
              </p>
            </div>
            <div className="flex-shrink-0 rounded-2xl border border-border bg-secondary/40 px-5 py-4 text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Inversión</p>
              <p className="mt-0.5 text-2xl font-black">$25.000</p>
              <p className="text-xs text-muted-foreground">+ IVA · pago único</p>
            </div>
          </div>

          <form onSubmit={submit} className="px-6 sm:px-10 py-8">
            {error && (
              <div className="mb-5 rounded-xl border px-4 py-3 text-sm text-red-300 bg-red-500/10 border-red-500/20">
                {error}
              </div>
            )}
            {ok && (
              <div className="mb-5 rounded-xl border px-4 py-3 text-sm text-green-300 bg-green-500/10 border-green-500/20 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Registro exitoso. Redirigiendo al carrito...
              </div>
            )}

            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Datos personales</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Nombre</label>
                  <input className={inputClass} value={form.firstName} onChange={e => setForm(s => ({ ...s, firstName: e.target.value }))} placeholder="Juan" required />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Apellido</label>
                  <input className={inputClass} value={form.lastName} onChange={e => setForm(s => ({ ...s, lastName: e.target.value }))} placeholder="Pérez" required />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">RUT (opcional)</label>
                  <input className={inputClass} value={form.rut} onChange={e => setForm(s => ({ ...s, rut: e.target.value }))} placeholder="12.345.678-9" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Teléfono</label>
                  <input className={inputClass} value={form.phoneNumber} onChange={e => setForm(s => ({ ...s, phoneNumber: e.target.value }))} placeholder="+56912345678" required />
                </div>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Acceso a la plataforma</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Correo electrónico</label>
                  <input type="email" className={inputClass} value={form.email} onChange={e => setForm(s => ({ ...s, email: e.target.value }))} placeholder="usuario@correo.com" required />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Contraseña</label>
                  <input type="password" className={inputClass} value={form.password} onChange={e => setForm(s => ({ ...s, password: e.target.value }))} placeholder="Mínimo 6 caracteres" minLength={6} required />
                </div>
              </div>
            </div>

            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Datos profesionales</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Ciudad</label>
                  <select className={selectClass} value={form.city} onChange={e => setForm(s => ({ ...s, city: e.target.value }))} required>
                    <option value="">Selecciona ciudad</option>
                    {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Área médica</label>
                  <select className={selectClass} value={form.medicalArea} onChange={e => setForm(s => ({ ...s, medicalArea: e.target.value }))} required>
                    <option value="">Selecciona área</option>
                    {AREAS_MEDICAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Lugar de trabajo</label>
                  <input className={inputClass} value={form.workplace} onChange={e => setForm(s => ({ ...s, workplace: e.target.value }))} placeholder="Clínica / Hospital" required />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white active:scale-[0.98] transition-transform disabled:opacity-60"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 10px 30px rgba(18,180,198,0.25)' }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Crear cuenta y continuar
              </button>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-1">
                Ya tengo cuenta →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
