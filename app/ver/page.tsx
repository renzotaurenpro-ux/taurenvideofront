'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Microscope,
  LogOut,
  User,
  BookOpen,
  Clock,
  Award,
  Shield,
  ChevronRight,
  FlaskConical,
} from 'lucide-react'
import SecureVideoPlayer from '@/components/SecureVideoPlayer'

interface UserData {
  email: string
}

const DEMO_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'

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
    if (!email || !paid) {
      router.push('/login')
      return
    }
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
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-cyan-600 border-t-transparent animate-spin" />
          <p className="text-white/30 text-sm">Cargando tu acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      <nav className="sticky top-0 z-40 bg-[#0d0d0d]/95 border-b border-white/5 px-6 py-3 backdrop-blur flex items-center justify-between flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600">
            <Microscope size={14} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm block leading-none">SCAI</span>
            <span className="text-white/40 text-xs leading-none">Inmunología Clínica</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5 text-xs text-white/50">
            <div className="h-5 w-5 rounded-full bg-cyan-600/30 flex items-center justify-center text-cyan-400 font-bold text-[10px]">
              {user.email[0].toUpperCase()}
            </div>
            <span className="hidden sm:block truncate max-w-[160px]">{user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <LogOut size={13} />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3 text-xs text-white/30 uppercase tracking-wider">
              <FlaskConical size={11} />
              <span>III Jornadas Regionales de Inmunología Clínica</span>
              <ChevronRight size={11} />
              <span className="text-white/50">Grabación completa</span>
            </div>

            <SecureVideoPlayer videoUrl={videoUrl} userEmail={user.email} />

            <div className="mt-5">
              <h1 className="text-xl md:text-2xl font-bold leading-snug">
                Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad
              </h1>
              <p className="text-white/40 text-sm mt-1 flex flex-wrap items-center gap-3">
                <span>Sociedad Chilena de Alergia e Inmunología · SCAI</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={12} /> 19 Junio 2026</span>
                <span>·</span>
                <span>6 módulos · 15 expositores</span>
                <span>·</span>
                <span>Acreditado CONACEM</span>
              </p>
            </div>

            <div className="mt-5 flex gap-1 border-b border-white/5">
              {(
                [
                  { key: 'descripcion', label: 'Descripción' },
                  { key: 'ponentes', label: 'Expositores' },
                  { key: 'programa', label: 'Programa' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === key
                      ? 'border-cyan-500 text-white'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              {activeTab === 'descripcion' && (
                <div className="space-y-4 text-white/60 text-sm leading-relaxed max-w-2xl">
                  <p>
                    Las III Jornadas Regionales de Inmunología Clínica de la Sociedad Chilena de Alergia
                    e Inmunología (SCAI) abordan uno de los temas más relevantes para el médico general
                    y especialista: los Errores Innatos de la Inmunidad (EII), también conocidos como
                    Inmunodeficiencias Primarias.
                  </p>
                  <p>
                    Esta grabación reúne a 15 especialistas de alto nivel que presentan la fisiopatología,
                    el diagnóstico clínico y de laboratorio, así como las estrategias terapéuticas más
                    actualizadas para el manejo de estas condiciones en distintos grupos etarios.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {[
                      { label: 'Fecha', value: '19 Jun 2026' },
                      { label: 'Módulos', value: '6' },
                      { label: 'Expositores', value: '15' },
                      { label: 'Idioma', value: 'Español' },
                      { label: 'Modalidad', value: 'Online' },
                      { label: 'Acreditación', value: 'CONACEM' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                        <p className="text-white/30 text-xs uppercase tracking-wide">{label}</p>
                        <p className="text-white font-semibold text-sm mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ponentes' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl">
                  {PONENTES.map(p => (
                    <div
                      key={p.nombre}
                      className="bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center gap-3"
                    >
                      <div className="h-12 w-12 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        {p.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-white leading-snug">{p.nombre}</p>
                        <p className="text-white/35 text-[11px] mt-0.5 leading-relaxed">
                          {p.especialidad}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'programa' && (
                <div className="space-y-2 max-w-xl">
                  {MODULOS.map((m, i) => (
                    <div
                      key={m.titulo}
                      className={`flex items-center gap-4 p-3.5 rounded-xl border transition-colors ${
                        m.activo
                          ? 'border-cyan-500/40 bg-cyan-600/10'
                          : 'border-white/5 bg-white/2 hover:bg-white/5'
                      }`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          m.activo ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${m.activo ? 'text-white' : 'text-white/60'}`}>
                          {m.titulo}
                        </p>
                      </div>
                      <span className="text-white/25 text-xs flex-shrink-0 flex items-center gap-1">
                        <Clock size={11} />
                        {m.duracion}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-gradient-to-br from-cyan-950/60 to-[#111] border border-cyan-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-cyan-600/20 flex items-center justify-center">
                  <User size={15} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wide">Sesión activa</p>
                  <p className="text-sm text-white font-medium truncate max-w-[200px]">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Acceso completo activo
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                Tu acceso incluye
              </h3>
              {[
                { icon: Microscope, label: 'Grabación completa HD' },
                { icon: Award, label: 'Acreditación CONACEM' },
                { icon: BookOpen, label: '6 módulos · 15 expositores' },
                { icon: Shield, label: 'Protección anticopia activa' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-white/50">
                  <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-cyan-400" />
                  </div>
                  {label}
                </div>
              ))}
            </div>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <p className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wide">Organiza</p>
              <p className="text-sm text-white/70">Sociedad Chilena de Alergia e Inmunología</p>
              <p className="text-xs text-cyan-400 mt-1">www.scai.cl · @scai.cl</p>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium py-3 rounded-xl transition-all">
              <Award size={15} />
              Descargar certificado
            </button>

            <div className="bg-[#111] border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-white/25 leading-relaxed text-center">
                Contenido protegido. Prohibida la grabación y distribución no autorizada. Sesión
                vinculada a tu cuenta personal.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
