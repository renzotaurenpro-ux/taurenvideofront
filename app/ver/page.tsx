'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Microscope, LogOut, User, BookOpen, Clock, Award, Shield, ChevronRight, FlaskConical } from 'lucide-react'
import SecureVideoPlayer from '@/components/SecureVideoPlayer'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'

interface UserData { email: string }

const DEMO_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'

const PONENTES = [
  { nombre: 'Dra. Ligia Rodríguez', especialidad: 'Inmunología Clínica', avatar: 'LR' },
  { nombre: 'Dra. Soledad Pérez', especialidad: 'Alergología Pediátrica', avatar: 'SP' },
  { nombre: 'Dra. Daniela Budinich', especialidad: 'Inmunología', avatar: 'DB' },
  { nombre: 'Dr. Francisco Roa', especialidad: 'Medicina Interna', avatar: 'FR' },
  { nombre: 'Dra. María de los Ángeles Morales', especialidad: 'Pediatría', avatar: 'MM' },
  { nombre: 'Dra. Bárbara Cid Troncoso', especialidad: 'Inmunología', avatar: 'BC' },
  { nombre: 'Dra. Evelyn Silva', especialidad: 'Alergología', avatar: 'ES' },
  { nombre: 'Dra. Patricia Vergara', especialidad: 'Inmunología Clínica', avatar: 'PV' },
  { nombre: 'Dr. Nicolás Faundes', especialidad: 'Medicina Familiar', avatar: 'NF' },
  { nombre: 'Dra. Illene Díaz', especialidad: 'Pediatría', avatar: 'ID' },
  { nombre: 'Dra. Lurimar Manrique', especialidad: 'Inmunología', avatar: 'LM' },
  { nombre: 'Dra. Pamela Méndez', especialidad: 'Alergología', avatar: 'PM' },
  { nombre: 'Dr. Francisco Cammarata', especialidad: 'Inmunología Clínica', avatar: 'FC' },
  { nombre: 'Dra. Fabiola Fernández', especialidad: 'Inmunología Pediátrica', avatar: 'FF' },
  { nombre: 'Dr. Alonso Hernández', especialidad: 'Medicina Interna', avatar: 'AH' },
]

const MODULOS = [
  { titulo: 'Apertura: Errores Innatos de la Inmunidad — Generalidades', duracion: '20 min', activo: true },
  { titulo: 'Inmunodeficiencias Primarias: Diagnóstico Temprano', duracion: '25 min', activo: false },
  { titulo: 'Manifestaciones Clínicas y Abordaje Diagnóstico', duracion: '30 min', activo: false },
  { titulo: 'Casos Clínicos: Presentaciones Complejas', duracion: '28 min', activo: false },
  { titulo: 'Terapias Actuales y Perspectivas Futuras', duracion: '22 min', activo: false },
  { titulo: 'Panel de Expertos y Cierre', duracion: '15 min', activo: false },
]

export default function VerPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'descripcion' | 'ponentes' | 'programa'>('descripcion')

  useEffect(() => {
    const email = localStorage.getItem('tauren-user-email')
    const paid = localStorage.getItem('tauren-user-paid') === 'true'
    if (!email || !paid) { router.push('/login'); return }
    setUser({ email })
    setVideoUrl(process.env.NEXT_PUBLIC_VIDEO_URL || DEMO_VIDEO)
    setLoading(false)
  }, [router])

  function handleLogout() {
    localStorage.removeItem('tauren-user-email')
    localStorage.removeItem('tauren-user-paid')
    router.push('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--scai-teal)', borderTopColor: 'transparent' }} />
          <p className="text-white/30 text-sm">Cargando tu acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: 'linear-gradient(160deg, #0B1928 0%, #0E2035 100%)' }}>
      <nav className="sticky top-0 z-40 border-b backdrop-blur flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0"
        style={{ background: 'rgba(11,25,40,0.95)', borderColor: 'rgba(18,180,198,0.15)' }}>
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image src={ScaiLogo} alt="SCAI" priority className="h-7 w-auto sm:h-8" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-white/50 min-w-0"
            style={{ background: 'rgba(18,180,198,0.08)', border: '1px solid rgba(18,180,198,0.15)' }}>
            <div className="h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 text-white"
              style={{ background: 'var(--scai-teal)' }}>
              {user.email[0].toUpperCase()}
            </div>
            <span className="hidden sm:block truncate max-w-[140px]">{user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 flex-shrink-0"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 xl:gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-3 text-xs text-white/30 uppercase tracking-wider overflow-hidden">
              <FlaskConical size={11} className="flex-shrink-0" />
              <span className="truncate hidden sm:block">III Jornadas Regionales de Inmunología Clínica</span>
              <span className="truncate sm:hidden">III Jornadas · SCAI</span>
              <ChevronRight size={11} className="flex-shrink-0" />
              <span className="text-white/50 flex-shrink-0">Grabación</span>
            </div>

            <SecureVideoPlayer videoUrl={videoUrl} userEmail={user.email} />

            <div className="mt-4">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold leading-snug">
                Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-white/40">
                <span className="hidden sm:inline">Sociedad Chilena de Alergia e Inmunología · SCAI</span>
                <span className="sm:hidden">SCAI</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={11} /> 19 Jun 2026</span>
                <span>·</span>
                <span>6 módulos · 15 ponentes</span>
                <span>·</span>
                <span>Acreditado CONACEM</span>
              </div>
            </div>

            <div className="mt-4 flex gap-0.5 border-b border-white/10 overflow-x-auto scrollbar-none">
              {([
                { key: 'descripcion', label: 'Descripción' },
                { key: 'ponentes', label: 'Expositores' },
                { key: 'programa', label: 'Programa' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${
                    activeTab === key ? 'text-white' : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                  style={activeTab === key ? { borderBottomColor: 'var(--scai-teal)' } : {}}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {activeTab === 'descripcion' && (
                <div className="space-y-3 text-white/60 text-sm leading-relaxed max-w-2xl">
                  <p>
                    Las III Jornadas Regionales de Inmunología Clínica de la Sociedad Chilena de Alergia
                    e Inmunología (SCAI) abordan los Errores Innatos de la Inmunidad (EII), también
                    conocidos como Inmunodeficiencias Primarias.
                  </p>
                  <p>
                    Esta grabación reúne a 15 especialistas que presentan la fisiopatología, el
                    diagnóstico clínico y de laboratorio, y las estrategias terapéuticas más actualizadas
                    para el manejo de estas condiciones en distintos grupos etarios.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                    {[
                      { label: 'Fecha', value: '19 Jun 2026' },
                      { label: 'Módulos', value: '6' },
                      { label: 'Expositores', value: '15' },
                      { label: 'Idioma', value: 'Español' },
                      { label: 'Modalidad', value: 'Online' },
                      { label: 'Acreditación', value: 'CONACEM' },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl p-3 border"
                        style={{ background: 'rgba(18,180,198,0.06)', borderColor: 'rgba(18,180,198,0.15)' }}>
                        <p className="text-white/30 text-xs uppercase tracking-wide">{label}</p>
                        <p className="text-white font-semibold text-sm mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ponentes' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                  {PONENTES.map(p => (
                    <div key={p.nombre} className="rounded-2xl border p-3 flex flex-col items-center text-center gap-2"
                      style={{ background: 'rgba(14,32,53,0.8)', borderColor: 'rgba(18,180,198,0.12)' }}>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                        style={{ background: 'rgba(18,180,198,0.12)', borderColor: 'rgba(18,180,198,0.3)', color: 'var(--scai-teal)' }}>
                        {p.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-[11px] sm:text-xs text-white leading-tight">{p.nombre}</p>
                        <p className="text-white/35 text-[10px] sm:text-[11px] mt-0.5 leading-relaxed hidden sm:block">{p.especialidad}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'programa' && (
                <div className="space-y-2">
                  {MODULOS.map((m, i) => (
                    <div key={m.titulo}
                      className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border transition-colors"
                      style={m.activo
                        ? { borderColor: 'rgba(18,180,198,0.4)', background: 'rgba(18,180,198,0.1)' }
                        : { borderColor: 'rgba(18,180,198,0.08)', background: 'rgba(14,32,53,0.5)' }}>
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                        style={m.activo ? { background: 'var(--scai-teal)' } : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm font-medium leading-snug ${m.activo ? 'text-white' : 'text-white/55'}`}>
                          {m.titulo}
                        </p>
                      </div>
                      <span className="text-white/25 text-xs flex-shrink-0 flex items-center gap-1">
                        <Clock size={10} />{m.duracion}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-3 xl:space-y-4">
            <div className="rounded-2xl p-4 sm:p-5 border"
              style={{ background: 'linear-gradient(135deg, rgba(18,180,198,0.15) 0%, rgba(14,32,53,0.9) 100%)', borderColor: 'rgba(18,180,198,0.25)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(18,180,198,0.2)' }}>
                  <User size={15} style={{ color: 'var(--scai-teal)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/40 uppercase tracking-wide">Sesión activa</p>
                  <p className="text-sm text-white font-medium truncate max-w-full">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                Acceso completo activo
              </div>
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border space-y-3"
              style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.12)' }}>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">Tu acceso incluye</h3>
              {[
                { icon: Microscope, label: 'Grabación completa HD' },
                { icon: Award, label: 'Acreditación CONACEM' },
                { icon: BookOpen, label: '6 módulos · 15 expositores' },
                { icon: Shield, label: 'Protección anticopia activa' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-white/50">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(18,180,198,0.1)' }}>
                    <Icon size={13} style={{ color: 'var(--scai-teal)' }} />
                  </div>
                  {label}
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border"
              style={{ background: 'rgba(14,32,53,0.9)', borderColor: 'rgba(18,180,198,0.12)' }}>
              <p className="text-xs text-white/40 mb-1 font-semibold uppercase tracking-wide">Organiza</p>
              <p className="text-sm text-white/70">Sociedad Chilena de Alergia e Inmunología</p>
              <p className="text-xs mt-1" style={{ color: 'var(--scai-teal)' }}>www.scai.cl · @scai.cl</p>
            </div>

            <button className="w-full flex items-center justify-center gap-2 border text-white/60 hover:text-white text-sm font-medium py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(18,180,198,0.08)', borderColor: 'rgba(18,180,198,0.2)' }}>
              <Award size={15} />
              Descargar certificado
            </button>

            <div className="rounded-2xl p-4 border" style={{ background: 'rgba(14,32,53,0.6)', borderColor: 'rgba(18,180,198,0.08)' }}>
              <p className="text-xs text-white/20 leading-relaxed text-center">
                Contenido protegido. Prohibida la grabación y distribución no autorizada.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
