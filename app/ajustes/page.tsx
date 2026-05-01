'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Lock, LogOut, CheckCircle2, Loader2, Shield, Building2, Phone, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/authContext'
import { fetchAuth } from '@/lib/api'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'

type Tab = 'perfil' | 'seguridad' | 'cuenta'

export default function AjustesPage() {
  const { firebaseUser, loading: authLoading, profile, logout } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('perfil')

  useEffect(() => {
    if (authLoading) return
    if (!firebaseUser) router.push('/login')
  }, [authLoading, firebaseUser, router])

  const [profileForm, setProfileForm] = useState({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    workplace: profile?.workplace ?? '',
    medicalArea: profile?.medicalArea ?? '',
    phoneNumber: profile?.phoneNumber ?? '',
    city: profile?.city ?? '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileOk, setProfileOk] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwOk, setPwOk] = useState(false)
  const [pwError, setPwError] = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileOk(false)
    setProfileLoading(true)
    try {
      const res = await fetchAuth('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      })
      if (!res.ok) throw new Error('No se pudo actualizar el perfil')
      setProfileOk(true)
      setTimeout(() => setProfileOk(false), 3000)
    } catch (err: any) {
      setProfileError(err?.message ?? 'Error al guardar')
    } finally {
      setProfileLoading(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwOk(false)
    if (pwForm.next !== pwForm.confirm) { setPwError('Las contraseñas no coinciden'); return }
    if (pwForm.next.length < 6) { setPwError('Mínimo 6 caracteres'); return }
    setPwLoading(true)
    try {
      const user = auth?.currentUser
      if (!user || !user.email) throw new Error('No autenticado')
      const cred = EmailAuthProvider.credential(user.email, pwForm.current)
      await reauthenticateWithCredential(user, cred)
      await updatePassword(user, pwForm.next)
      setPwOk(true)
      setPwForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwOk(false), 3000)
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setPwError('Contraseña actual incorrecta')
      } else {
        setPwError(err?.message ?? 'Error al cambiar contraseña')
      }
    } finally {
      setPwLoading(false)
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'ELIMINAR') { setDeleteError('Escribe ELIMINAR para confirmar'); return }
    setDeleteLoading(true)
    setDeleteError('')
    try {
      await fetchAuth('/auth/account', { method: 'DELETE' })
      await logout()
      router.push('/')
    } catch (err: any) {
      setDeleteError(err?.message ?? 'Error al eliminar cuenta')
      setDeleteLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors bg-white/5 border border-white/10 focus:border-[var(--scai-teal)]'

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'perfil', label: 'Perfil', icon: <User size={15} /> },
    { id: 'seguridad', label: 'Seguridad', icon: <Lock size={15} /> },
    { id: 'cuenta', label: 'Cuenta', icon: <Shield size={15} /> },
  ]

  return (
    <div className="min-h-screen px-4 py-8 sm:py-12"
      style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 60%, #0B2240 100%)' }}>
      <div className="mx-auto w-full max-w-6xl">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/ver" className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/70 transition-colors">
            <ArrowLeft size={15} />
            Volver
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-sm text-white/50">Ajustes</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          <div className="lg:sticky lg:top-4 self-start">
            <div className="rounded-2xl border overflow-hidden"
              style={{ background: 'rgba(14,32,53,0.7)', borderColor: 'rgba(18,180,198,0.15)' }}>
              <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/30">Cuenta</p>
                <h1 className="mt-2 text-xl font-black text-white">Ajustes</h1>
                <p className="text-white/40 text-xs mt-1 truncate">
                  {profile ? `Dr. ${profile.firstName} ${profile.lastName}` : firebaseUser?.email}
                </p>
              </div>

              <div className="p-2">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={tab === t.id
                      ? { background: 'rgba(18,180,198,0.16)', color: '#fff', border: '1px solid rgba(18,180,198,0.22)' }
                      : { color: 'rgba(255,255,255,0.55)' }
                    }
                  >
                    <span className="flex items-center gap-2">
                      <span style={{ color: tab === t.id ? 'var(--scai-teal)' : 'rgba(255,255,255,0.35)' }}>
                        {t.icon}
                      </span>
                      {t.label}
                    </span>
                    <span className="text-white/25">›</span>
                  </button>
                ))}
              </div>

              <div className="p-4 border-t flex items-center justify-between"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <Link href="/ver" className="text-xs text-white/25 hover:text-white/60 transition-colors">Video</Link>
                <span className="text-white/10">·</span>
                <Link href="/carrito" className="text-xs text-white/25 hover:text-white/60 transition-colors">Carrito</Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden"
            style={{ background: 'rgba(14,32,53,0.85)', borderColor: 'rgba(18,180,198,0.15)' }}>

          {tab === 'perfil' && (
            <form onSubmit={saveProfile} className="p-6 sm:p-8 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4 flex items-center gap-2">
                  <User size={13} /> Datos personales
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Nombre</label>
                    <input
                      className={inputClass}
                      value={profileForm.firstName}
                      onChange={e => setProfileForm(s => ({ ...s, firstName: e.target.value }))}
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Apellido</label>
                    <input
                      className={inputClass}
                      value={profileForm.lastName}
                      onChange={e => setProfileForm(s => ({ ...s, lastName: e.target.value }))}
                      placeholder="Pérez"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4 flex items-center gap-2">
                  <Building2 size={13} /> Datos profesionales
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5 flex items-center gap-1">
                      <Building2 size={11} /> Lugar de trabajo
                    </label>
                    <input
                      className={inputClass}
                      value={profileForm.workplace}
                      onChange={e => setProfileForm(s => ({ ...s, workplace: e.target.value }))}
                      placeholder="Clínica / Hospital"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5 flex items-center gap-1">
                      <MapPin size={11} /> Ciudad
                    </label>
                    <input
                      className={inputClass}
                      value={profileForm.city}
                      onChange={e => setProfileForm(s => ({ ...s, city: e.target.value }))}
                      placeholder="Santiago"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Área médica</label>
                    <input
                      className={inputClass}
                      value={profileForm.medicalArea}
                      onChange={e => setProfileForm(s => ({ ...s, medicalArea: e.target.value }))}
                      placeholder="Cardiología"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5 flex items-center gap-1">
                      <Phone size={11} /> Teléfono
                    </label>
                    <input
                      className={inputClass}
                      value={profileForm.phoneNumber}
                      onChange={e => setProfileForm(s => ({ ...s, phoneNumber: e.target.value }))}
                      placeholder="+56912345678"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-xs text-white/30 mb-1.5">Correo electrónico</label>
                <div className="rounded-xl px-4 py-3 text-sm text-white/30 bg-white/5 border border-white/5 select-none">
                  {firebaseUser?.email}
                </div>
                <p className="text-[11px] text-white/20 mt-1.5">El correo no puede modificarse</p>
              </div>

              {profileError && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                  {profileError}
                </div>
              )}
              {profileOk && (
                <div className="rounded-xl px-4 py-3 text-sm text-green-300 bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                  <CheckCircle2 size={15} /> Perfil actualizado correctamente
                </div>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 16px rgba(18,180,198,0.25)' }}
              >
                {profileLoading && <Loader2 size={14} className="animate-spin" />}
                Guardar cambios
              </button>
            </form>
          )}

          {tab === 'seguridad' && (
            <form onSubmit={changePassword} className="p-6 sm:p-8 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4 flex items-center gap-2">
                <Lock size={13} /> Cambiar contraseña
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Contraseña actual</label>
                  <input
                    type="password"
                    className={inputClass}
                    value={pwForm.current}
                    onChange={e => setPwForm(s => ({ ...s, current: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Nueva contraseña</label>
                  <input
                    type="password"
                    className={inputClass}
                    value={pwForm.next}
                    onChange={e => setPwForm(s => ({ ...s, next: e.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    className={inputClass}
                    value={pwForm.confirm}
                    onChange={e => setPwForm(s => ({ ...s, confirm: e.target.value }))}
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>
              </div>

              {pwError && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                  {pwError}
                </div>
              )}
              {pwOk && (
                <div className="rounded-xl px-4 py-3 text-sm text-green-300 bg-green-500/10 border border-green-500/20 flex items-center gap-2">
                  <CheckCircle2 size={15} /> Contraseña actualizada correctamente
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: 'var(--scai-teal)', boxShadow: '0 4px 16px rgba(18,180,198,0.25)' }}
              >
                {pwLoading && <Loader2 size={14} className="animate-spin" />}
                Actualizar contraseña
              </button>
            </form>
          )}

          {tab === 'cuenta' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-4 flex items-center gap-2">
                  <LogOut size={13} /> Sesión
                </p>
                <div className="rounded-xl border p-4 flex items-center justify-between"
                  style={{ background: 'rgba(18,180,198,0.06)', borderColor: 'rgba(18,180,198,0.15)' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">Cerrar sesión</p>
                    <p className="text-xs text-white/40 mt-0.5">Salir de tu cuenta en este dispositivo</p>
                  </div>
                  <button
                    onClick={async () => { await logout(); router.push('/') }}
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 border hover:text-white transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400/60 mb-4 flex items-center gap-2">
                  <Shield size={13} /> Zona de peligro
                </p>
                <div className="rounded-xl border p-4 space-y-3"
                  style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.2)' }}>
                  <p className="text-sm font-semibold text-white">Eliminar cuenta</p>
                  <p className="text-xs text-white/40 leading-relaxed">
                    Esta acción es irreversible. Se eliminarán tus datos y perderás el acceso al contenido.
                  </p>
                  <div>
                    <label className="block text-xs text-white/30 mb-1.5">Escribe <span className="font-bold text-red-400">ELIMINAR</span> para confirmar</label>
                    <input
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none bg-white/5 border border-red-500/20 focus:border-red-500/50 transition-colors"
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                      placeholder="ELIMINAR"
                    />
                  </div>
                  {deleteError && (
                    <div className="rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                      {deleteError}
                    </div>
                  )}
                  <button
                    onClick={deleteAccount}
                    disabled={deleteLoading || deleteConfirm !== 'ELIMINAR'}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-30 transition-all"
                    style={{ background: 'rgba(239,68,68,0.8)', boxShadow: deleteConfirm === 'ELIMINAR' ? '0 4px 16px rgba(239,68,68,0.3)' : 'none' }}
                  >
                    {deleteLoading && <Loader2 size={14} className="animate-spin" />}
                    Eliminar mi cuenta permanentemente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
