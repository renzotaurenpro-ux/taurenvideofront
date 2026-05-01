'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, LogOut, Upload, Video, Shield } from 'lucide-react'
import ScaiLogo from '../../Logotipo-SCAI.png'

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

const LS_AUTH = 'tauren-admin-auth'
const LS_VIDEO = 'tauren-admin-video'

function readAuth(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(LS_AUTH) === 'true'
}

function writeAuth(v: boolean) {
  localStorage.setItem(LS_AUTH, v ? 'true' : 'false')
}

function readVideo(): { name: string; size: number; type: string; ts: number } | null {
  try {
    const raw = localStorage.getItem(LS_VIDEO)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { name: string; size: number; type: string; ts: number }
    if (!parsed?.name) return null
    return parsed
  } catch {
    return null
  }
}

function writeVideo(v: { name: string; size: number; type: string; ts: number } | null) {
  if (!v) {
    localStorage.removeItem(LS_VIDEO)
    return
  }
  localStorage.setItem(LS_VIDEO, JSON.stringify(v))
}

function formatBytes(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i += 1
  }
  const fixed = i === 0 ? 0 : n >= 10 ? 1 : 2
  return `${n.toFixed(fixed)} ${units[i]}`
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [lastVideo, setLastVideo] = useState<ReturnType<typeof readVideo>>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
    setAuthed(readAuth())
    setLastVideo(readVideo())
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const canLogin = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password])

  function logout() {
    writeAuth(false)
    setAuthed(false)
    setEmail('')
    setPassword('')
    setError('')
    setFile(null)
    setState('idle')
    setProgress(0)
  }

  function login(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!canLogin) return
    if (password !== 'admin' && password !== '1234') {
      setError('Credenciales inválidas')
      return
    }
    writeAuth(true)
    setAuthed(true)
  }

  function stopTimer() {
    if (!timerRef.current) return
    window.clearInterval(timerRef.current)
    timerRef.current = null
  }

  function startFakeUpload() {
    if (!file) return
    setState('uploading')
    setProgress(0)
    stopTimer()
    const startedAt = Date.now()
    const durationMs = Math.min(9000, Math.max(1800, Math.floor(file.size / (1024 * 1024)) * 900))
    timerRef.current = window.setInterval(() => {
      const t = Date.now() - startedAt
      const p = Math.min(100, Math.floor((t / durationMs) * 100))
      setProgress(p)
      if (p >= 100) {
        stopTimer()
        setState('done')
        const meta = { name: file.name, size: file.size, type: file.type, ts: Date.now() }
        writeVideo(meta)
        setLastVideo(meta)
      }
    }, 80)
  }

  function resetUpload() {
    stopTimer()
    setFile(null)
    setState('idle')
    setProgress(0)
  }

  function clearSaved() {
    writeVideo(null)
    setLastVideo(null)
  }

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 60%, #0B2240 100%)' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/ver" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors flex-shrink-0">
              <ArrowLeft size={16} />
              <span className="text-sm">Video</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 min-w-0">
              <Image src={ScaiLogo} alt="SCAI" priority className="h-6 w-auto flex-shrink-0" />
              <span className="text-sm font-semibold text-white/70 truncate">Panel Admin</span>
            </div>
          </div>
          {authed ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white border transition-colors"
              style={{ background: 'rgba(18,180,198,0.08)', borderColor: 'rgba(18,180,198,0.2)' }}
            >
              <LogOut size={16} />
              Salir
            </button>
          ) : null}
        </div>

        {!authed ? (
          <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="rounded-2xl border p-6 sm:p-8" style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black leading-tight">Acceso Admin</h1>
                  <p className="text-white/45 text-sm mt-2 max-w-md">Login temporal. Después se conectará al backend.</p>
                </div>
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,180,198,0.16)' }}>
                  <Shield size={18} style={{ color: 'var(--scai-teal)' }} />
                </div>
              </div>

              {error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm mb-5">
                  {error}
                </div>
              ) : null}

              <form onSubmit={login} className="space-y-4">
                <div>
                  <label className="block text-white/50 text-sm mb-2">Correo</label>
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    placeholder="admin@scai.cl"
                    className="w-full rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors text-base"
                    style={{ background: 'rgba(11,25,40,0.8)', border: '1px solid rgba(18,180,198,0.2)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--scai-teal)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(18,180,198,0.2)'}
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-2">Contraseña</label>
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type="password"
                    placeholder="admin"
                    className="w-full rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none transition-colors text-base"
                    style={{ background: 'rgba(11,25,40,0.8)', border: '1px solid rgba(18,180,198,0.2)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--scai-teal)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(18,180,198,0.2)'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!canLogin}
                  className="w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-base disabled:opacity-50"
                  style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 16px rgba(18,180,198,0.3)' }}
                >
                  Entrar
                </button>
              </form>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: 'rgba(14,32,53,0.65)', borderColor: 'rgba(18,180,198,0.12)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">Credenciales</p>
              <div className="space-y-2 text-sm text-white/55">
                <div className="flex items-center justify-between gap-3">
                  <span>Contraseña</span>
                  <span className="font-mono text-white/70">admin</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Alternativa</span>
                  <span className="font-mono text-white/70">1234</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
            <div className="rounded-2xl border p-6 sm:p-8" style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.2)' }}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight">Subir video</h2>
                  <p className="text-white/45 text-sm mt-2">Carga temporal local. Luego se conectará a tu backend.</p>
                </div>
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,180,198,0.16)' }}>
                  <Upload size={18} style={{ color: 'var(--scai-teal)' }} />
                </div>
              </div>

              <div className="rounded-2xl border p-4 sm:p-5" style={{ background: 'rgba(11,25,40,0.55)', borderColor: 'rgba(18,180,198,0.15)' }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,180,198,0.14)' }}>
                      <Video size={18} style={{ color: 'var(--scai-teal)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/80 truncate">{file ? file.name : 'Selecciona un archivo'}</p>
                      <p className="text-xs text-white/35 mt-0.5">{file ? `${formatBytes(file.size)} · ${file.type || 'video'}` : 'MP4 recomendado'}</p>
                    </div>
                  </div>
                  <label
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white border transition-colors cursor-pointer flex-shrink-0"
                    style={{ background: 'rgba(18,180,198,0.08)', borderColor: 'rgba(18,180,198,0.2)' }}
                  >
                    Elegir
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0] || null
                        setFile(f)
                        setState('idle')
                        setProgress(0)
                      }}
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={startFakeUpload}
                    disabled={!file || state === 'uploading'}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all active:scale-[0.99] disabled:opacity-50"
                    style={{ background: 'var(--scai-teal)', boxShadow: '0 6px 20px rgba(18,180,198,0.25)' }}
                  >
                    <Upload size={16} />
                    Subir
                  </button>
                  <button
                    onClick={resetUpload}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white/70 hover:text-white border transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.10)' }}
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-100"
                      style={{ width: `${progress}%`, background: 'var(--scai-teal)' }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-white/35">
                    <span>
                      {state === 'uploading' ? 'Subiendo...' : state === 'done' ? 'Listo' : 'En espera'}
                    </span>
                    <span className="tabular-nums">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ background: 'rgba(14,32,53,0.65)', borderColor: 'rgba(18,180,198,0.12)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">Última carga</p>
                {lastVideo ? (
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-white/80 break-words">{lastVideo.name}</p>
                    <p className="text-xs text-white/35">{formatBytes(lastVideo.size)} · {lastVideo.type || 'video'}</p>
                    <p className="text-xs text-white/25 tabular-nums">{new Date(lastVideo.ts).toLocaleString('es-CL')}</p>
                    <button
                      onClick={clearSaved}
                      className="mt-3 w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:text-white border transition-colors"
                      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.10)' }}
                    >
                      Limpiar
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-white/45">Sin cargas todavía</p>
                )}
              </div>

              <div className="rounded-2xl border p-6" style={{ background: 'rgba(14,32,53,0.65)', borderColor: 'rgba(18,180,198,0.12)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/40 mb-3">Ruta</p>
                <p className="text-sm text-white/55 break-words">/admin</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

