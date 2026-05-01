'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Eye, EyeOff, LogOut, Upload, Video, Shield, CheckCircle2, Loader2, FileVideo, X } from 'lucide-react'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import * as tus from 'tus-js-client'

const API_BASE = '/api/proxy'
const ADMIN_SESSION_KEY = 'tauren-admin-session'
const TOKEN_TTL = 50 * 60 * 1000
const MAX_FILE_SIZE = 5.5 * 1024 * 1024 * 1024

type Step = 'form' | 'preparing' | 'uploading' | 'registering' | 'done' | 'error'

interface AdminSession {
  uid: string
  email: string
  token: string
  ts: number
}

function loadSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as AdminSession
    if (Date.now() - s.ts > TOKEN_TTL) { localStorage.removeItem(ADMIN_SESSION_KEY); return null }
    return s
  } catch { return null }
}

function saveSession(s: AdminSession) {
  try { localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(s)) } catch {}
}

function clearSession() {
  try { localStorage.removeItem(ADMIN_SESSION_KEY) } catch {}
}

function formatBytes(b: number) {
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0; let n = b
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(i === 0 ? 0 : n >= 10 ? 1 : 2)} ${u[i]}`
}

function formatTime(secs: number) {
  if (!secs || !isFinite(secs)) return '--'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

const inputClass = 'w-full rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors text-base'
const inputStyle = { background: 'rgba(11,25,40,0.8)', border: '1px solid rgba(18,180,198,0.2)' }

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState<AdminSession | null>(null)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const [title, setTitle] = useState('')
  const [priceClp, setPriceClp] = useState('25000')
  const [published, setPublished] = useState(true)
  const [description, setDescription] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>('form')
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [eta, setEta] = useState(0)
  const [error, setError] = useState('')

  const tusRef = useRef<tus.Upload | null>(null)
  const startTimeRef = useRef(0)
  const uploadedRef = useRef(0)

  useEffect(() => {
    setMounted(true)
    setSession(loadSession())
    return () => { if (tusRef.current) tusRef.current.abort() }
  }, [])

  async function getToken(): Promise<string> {
    if (!session) throw new Error('Sin sesión')
    try {
      const user = auth?.currentUser
      if (user?.uid === session.uid) {
        const fresh = await user.getIdToken()
        const updated = { ...session, token: fresh, ts: Date.now() }
        saveSession(updated)
        setSession(updated)
        return fresh
      }
    } catch {}
    return session.token
  }

  const canUpload = useMemo(() => (
    !!session && !!title.trim() && /^[0-9]+$/.test(priceClp.trim()) && !!file && step === 'form'
  ), [session, title, priceClp, file, step])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      const token = await credential.user.getIdToken()

      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('No se pudo verificar el perfil')
      const profile = await res.json()

      if ((profile?.role ?? '').toUpperCase() !== 'ADMIN') {
        await signOut(auth)
        throw new Error('Tu cuenta no tiene permisos de administrador')
      }

      const s: AdminSession = { uid: credential.user.uid, email: credential.user.email ?? loginEmail, token, ts: Date.now() }
      saveSession(s)
      setSession(s)
      setLoginEmail('')
      setLoginPassword('')
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setLoginError('Correo o contraseña incorrectos')
      } else {
        setLoginError(err?.message || 'Error al iniciar sesión')
      }
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleLogout() {
    clearSession()
    setSession(null)
    if (auth) await signOut(auth).catch(() => {})
  }

  function resetAll() {
    if (tusRef.current) tusRef.current.abort()
    tusRef.current = null
    setStep('form')
    setProgress(0)
    setSpeed(0)
    setEta(0)
    setError('')
    setFile(null)
  }

  async function startUpload() {
    if (!file || !session) return
    setError('')
    setStep('preparing')
    setProgress(0)

    try {
      const token = await getToken()
      const meta = {
        title: title.trim(),
        priceClp: parseInt(priceClp.trim(), 10),
        published,
        ...(description.trim() ? { description: description.trim() } : {}),
      }

      const prepRes = await fetch(`${API_BASE}/videos/admin/prepare-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(meta),
      })
      if (!prepRes.ok) {
        const d = await prepRes.json().catch(() => null)
        throw new Error(d?.message || 'Error al preparar la subida')
      }
      const prepared = await prepRes.json()

      setStep('uploading')
      startTimeRef.current = Date.now()
      uploadedRef.current = 0

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: prepared.uploadUrl,
          headers: prepared.uploadHeaders,
          chunkSize: 5 * 1024 * 1024,
          retryDelays: [0, 1000, 3000, 5000, 10000],
          metadata: {
            filename: file.name,
            filetype: file.type || 'video/mp4',
          },
          onError: (err) => reject(err),
          onProgress: (bytesUploaded, bytesTotal) => {
            const pct = Math.round((bytesUploaded / bytesTotal) * 100)
            setProgress(pct)

            const elapsed = (Date.now() - startTimeRef.current) / 1000
            if (elapsed > 0.5) {
              const spd = bytesUploaded / elapsed
              setSpeed(spd)
              const remaining = bytesTotal - bytesUploaded
              setEta(spd > 0 ? remaining / spd : 0)
            }
          },
          onSuccess: () => resolve(),
        })

        tusRef.current = upload
        upload.start()
      })

      setStep('registering')
      const regToken = await getToken()

      const regRes = await fetch(`${API_BASE}/videos/admin/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${regToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bunnyVideoId: prepared.videoId,
          ...meta,
        }),
      })
      if (!regRes.ok) {
        const d = await regRes.json().catch(() => null)
        throw new Error(d?.message || 'Error al registrar el video')
      }

      setStep('done')
      setProgress(100)
    } catch (err: any) {
      setStep('error')
      setError(err?.message || 'Error durante la subida')
    }
  }

  if (!mounted) return <div className="min-h-screen" style={{ background: '#0B1928' }} />

  const stepLabels: Record<Step, string> = {
    form: 'Listo para subir',
    preparing: 'Preparando subida...',
    uploading: 'Subiendo a Bunny CDN...',
    registering: 'Registrando en base de datos...',
    done: 'Completado',
    error: 'Error',
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 60%, #0B2240 100%)' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">

        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors flex-shrink-0">
              <ArrowLeft size={16} />
              <span className="text-sm">Inicio</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 min-w-0">
              <Image src={ScaiLogo} alt="SCAI" priority className="h-6 w-auto flex-shrink-0" />
              <span className="text-sm font-semibold text-white/70 truncate">Panel Admin</span>
            </div>
          </div>
          {session && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="hidden sm:block text-xs text-white/35 truncate max-w-[160px]">{session.email}</span>
              <button onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white border transition-colors"
                style={{ background: 'rgba(18,180,198,0.08)', borderColor: 'rgba(18,180,198,0.2)' }}>
                <LogOut size={15} /> Salir
              </button>
            </div>
          )}
        </div>

        {!session ? (
          <div className="max-w-md mx-auto">
            <div className="rounded-2xl border p-6 sm:p-8" style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--scai-teal)' }}>Panel Admin</p>
                  <h1 className="text-2xl font-black text-white">Acceso administrativo</h1>
                  <p className="text-white/40 text-sm mt-1">Solo administradores autorizados.</p>
                </div>
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,180,198,0.16)' }}>
                  <Shield size={18} style={{ color: 'var(--scai-teal)' }} />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm mb-5">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-white/50 text-sm mb-2">Correo</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                    placeholder="admin@scai.cl" className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--scai-teal)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(18,180,198,0.2)'} />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-2">Contraseña</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)} required placeholder="••••••••"
                      className={`${inputClass} pr-12`} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--scai-teal)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(18,180,198,0.2)'} />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loginLoading || !loginEmail || !loginPassword}
                  className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 16px rgba(18,180,198,0.3)' }}>
                  {loginLoading && <Loader2 size={16} className="animate-spin" />}
                  {loginLoading ? 'Verificando...' : 'Ingresar al panel'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
            <div className="rounded-2xl border p-6 sm:p-8" style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">Subir video</h2>
                  <p className="text-white/45 text-sm mt-1">Subida directa a Bunny CDN (hasta 5 GB)</p>
                </div>
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,180,198,0.16)' }}>
                  <Upload size={18} style={{ color: 'var(--scai-teal)' }} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="block text-white/50 text-sm mb-2">Título *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="III Jornadas de Inmunología..."
                    disabled={step !== 'form'}
                    className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--scai-teal)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(18,180,198,0.2)'} />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-2">Precio CLP *</label>
                  <input value={priceClp}
                    onChange={e => setPriceClp(e.target.value.replace(/[^0-9]/g, ''))}
                    inputMode="numeric" placeholder="25000"
                    disabled={step !== 'form'}
                    className={inputClass} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--scai-teal)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(18,180,198,0.2)'} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-white/50 text-sm mb-2">Descripción</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    placeholder="Descripción (opcional)"
                    disabled={step !== 'form'}
                    className={inputClass} style={{ ...inputStyle, resize: 'none' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--scai-teal)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(18,180,198,0.2)'} />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                  style={{ background: 'rgba(11,25,40,0.55)', borderColor: 'rgba(18,180,198,0.15)' }}>
                  <div>
                    <p className="text-sm font-semibold text-white/80">Publicado</p>
                    <p className="text-xs text-white/35 mt-0.5">Visible inmediatamente en el carrito</p>
                  </div>
                  <button type="button" onClick={() => step === 'form' && setPublished(v => !v)}
                    className="rounded-xl px-5 py-2 text-sm font-semibold border transition-all"
                    style={published
                      ? { background: 'rgba(18,180,198,0.16)', borderColor: 'rgba(18,180,198,0.3)', color: 'var(--scai-teal)' }
                      : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    {published ? 'Sí' : 'No'}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border p-4 sm:p-5" style={{ background: 'rgba(11,25,40,0.55)', borderColor: 'rgba(18,180,198,0.15)' }}>
                {file ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,180,198,0.14)' }}>
                        <FileVideo size={18} style={{ color: 'var(--scai-teal)' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white/80 truncate">{file.name}</p>
                        <p className="text-xs text-white/35 mt-0.5">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    {step === 'form' && (
                      <button onClick={() => setFile(null)}
                        className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 p-1">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-8 cursor-pointer group">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3 transition-colors"
                      style={{ background: 'rgba(18,180,198,0.1)' }}>
                      <Video size={24} className="text-white/30 group-hover:text-white/60 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">
                      Click para seleccionar video
                    </p>
                    <p className="text-xs text-white/25 mt-1">MP4 recomendado · hasta 5 GB</p>
                    <input type="file" accept="video/*" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        if (f.size > MAX_FILE_SIZE) { setError(`Archivo muy grande (${formatBytes(f.size)}). Máximo 5 GB.`); return }
                        setFile(f)
                        setError('')
                      }} />
                  </label>
                )}

                {(step !== 'form') && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50 flex items-center gap-1.5">
                        {(step === 'preparing' || step === 'uploading' || step === 'registering') && (
                          <Loader2 size={12} className="animate-spin" />
                        )}
                        {step === 'done' && <CheckCircle2 size={12} style={{ color: 'var(--scai-teal)' }} />}
                        {stepLabels[step]}
                      </span>
                      {step === 'uploading' && (
                        <span className="text-xs text-white/30 tabular-nums">
                          {formatBytes(speed)}/s · {formatTime(eta)}
                        </span>
                      )}
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-[width] duration-200"
                        style={{
                          width: step === 'preparing' ? '10%' : step === 'registering' ? '95%' : step === 'done' ? '100%' : `${progress}%`,
                          background: step === 'error' ? '#ef4444' : 'var(--scai-teal)',
                        }} />
                    </div>
                    <p className="text-right text-xs text-white/25 mt-1 tabular-nums">{progress}%</p>

                    {step === 'uploading' && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <p className="text-[10px] uppercase text-white/25">Subido</p>
                          <p className="text-xs font-semibold text-white/60 tabular-nums">
                            {formatBytes(file ? (progress / 100) * file.size : 0)}
                          </p>
                        </div>
                        <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <p className="text-[10px] uppercase text-white/25">Velocidad</p>
                          <p className="text-xs font-semibold text-white/60 tabular-nums">{formatBytes(speed)}/s</p>
                        </div>
                        <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <p className="text-[10px] uppercase text-white/25">Restante</p>
                          <p className="text-xs font-semibold text-white/60 tabular-nums">{formatTime(eta)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-2.5">
                  {step === 'form' && (
                    <button onClick={startUpload} disabled={!canUpload}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-40 transition-all active:scale-[0.99]"
                      style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 16px rgba(18,180,198,0.25)' }}>
                      <Upload size={15} /> Subir video
                    </button>
                  )}
                  {(step === 'done' || step === 'error') && (
                    <button onClick={resetAll}
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all active:scale-[0.99]"
                      style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 16px rgba(18,180,198,0.25)' }}>
                      <Upload size={15} /> Subir otro video
                    </button>
                  )}
                  {step === 'uploading' && (
                    <button onClick={() => { if (tusRef.current) tusRef.current.abort(); setStep('error'); setError('Subida cancelada') }}
                      className="rounded-xl px-5 py-3 text-sm font-semibold text-red-300 border border-red-500/20 hover:border-red-500/40 transition-colors">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
                  {error}
                </div>
              )}
              {step === 'done' && (
                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-300 text-sm flex items-center gap-2">
                  <CheckCircle2 size={15} /> Video subido y registrado correctamente
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border p-5" style={{ background: 'rgba(14,32,53,0.65)', borderColor: 'rgba(18,180,198,0.12)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">Sesión admin</p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                    style={{ background: 'var(--scai-teal)' }}>
                    {session.email[0]?.toUpperCase()}
                  </div>
                  <p className="text-sm font-semibold text-white/80 truncate">{session.email}</p>
                </div>
                <p className="text-xs text-white/30">Expira en ~{Math.max(0, Math.round((TOKEN_TTL - (Date.now() - session.ts)) / 60000))} min</p>
              </div>

              <div className="rounded-2xl border p-5" style={{ background: 'rgba(14,32,53,0.65)', borderColor: 'rgba(18,180,198,0.12)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">Proceso de subida</p>
                <div className="space-y-2">
                  {[
                    { s: 'preparing', label: 'Preparar (Bunny)' },
                    { s: 'uploading', label: 'Subir archivo (TUS)' },
                    { s: 'registering', label: 'Registrar en BD' },
                  ].map((item, idx) => {
                    const steps: Step[] = ['preparing', 'uploading', 'registering', 'done']
                    const current = steps.indexOf(step)
                    const itemIdx = steps.indexOf(item.s as Step)
                    const isDone = current > itemIdx || step === 'done'
                    const isCurrent = step === item.s
                    return (
                      <div key={item.s} className="flex items-center gap-2.5 text-sm">
                        <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isDone ? 'var(--scai-teal)' : isCurrent ? 'rgba(18,180,198,0.3)' : 'rgba(255,255,255,0.06)',
                          }}>
                          {isDone ? <CheckCircle2 size={12} className="text-white" /> :
                            isCurrent ? <Loader2 size={11} className="text-white animate-spin" /> :
                              <span className="text-[10px] text-white/30">{idx + 1}</span>}
                        </div>
                        <span className={isDone ? 'text-white/70' : isCurrent ? 'text-white font-semibold' : 'text-white/30'}>
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
