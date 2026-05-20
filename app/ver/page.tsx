'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Award, ChevronRight, FlaskConical, ShoppingCart, Lock, User, ChevronDown } from 'lucide-react'
import SecureVideoPlayer from '@/components/SecureVideoPlayer'
import PageBackground from '@/components/PageBackground'
import Image from 'next/image'
import ScaiLogo from '../../Logotipo-SCAI.png'
import { addToCart, hasItem } from '@/lib/cart'
import { useAuth } from '@/lib/authContext'
import { fetchAuth } from '@/lib/api'
import { fetchPublishedVideos, fetchVideoById, normalizeBunnyUrl } from '@/lib/videos'
import { staticVideoPath, staticVideoMime, lessonFile } from '@/lib/staticVideos'
import { CERT_PASSED_KEY } from '@/lib/certTest'
import { fetchMyCertificates } from '@/lib/exams'

const DEMO_VIDEO = 'https://player.vimeo.com/video/76979871?h=8272103f6e&title=0&byline=0&portrait=0&autoplay=0&muted=0&loop=0'
const PRODUCT = {
  id: 'scai-jornadas-2026',
  title: 'III Jornadas Regionales de Inmunología Clínica',
  subtitle: 'Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad',
  priceNeto: 25000,
}

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


const MODULOS_DATA = [
  {
    titulo: 'Módulo 1 · Errores Innatos de la Inmunidad',
    videos: [
      { titulo: 'Apertura y marco conceptual', duracion: '18 min', file: 'Video Modulo 1 - Primera Clase.mp4' },
      { titulo: 'Bases moleculares y fenotípicas', duracion: '22 min', file: 'Video Modulo 1  - Segunda Presentación.mov' },
      { titulo: 'Enfoque clínico inicial', duracion: '24 min', file: 'Video Modulo 1  - Tercera Presentación.mp4' },
      { titulo: 'Mesa de preguntas — bloque 1', duracion: '16 min', file: 'Video Modulo 1  - Tercera Presentación.mp4' },
    ],
  },
  {
    titulo: 'Módulo 2 · Diagnóstico y laboratorio',
    videos: [
      { titulo: 'Inmunodeficiencias primarias: enfoque temprano', duracion: '25 min', file: 'Video Modulo 1 - Primera Clase.mp4' },
      { titulo: 'Citometría de flujo en práctica clínica', duracion: '28 min', file: 'Video Modulo 1  - Segunda Presentación.mov' },
      { titulo: 'Genética molecular y utilidad práctica', duracion: '26 min', file: 'Video Modulo 1  - Tercera Presentación.mp4' },
      { titulo: 'Correlación clínico-laboratorio', duracion: '21 min', file: 'Video Modulo 1 - Primera Clase.mp4' },
    ],
  },
  {
    titulo: 'Módulo 3 · Manifestaciones y abordaje',
    videos: [
      { titulo: 'Manifestaciones sistémicas complejas', duracion: '30 min', file: 'Video Modulo 1 - Primera Clase.mp4' },
      { titulo: 'Solapamiento autoinmune y autoinflamación', duracion: '27 min', file: 'Video Modulo 1  - Segunda Presentación.mov' },
      { titulo: 'Casos clínicos transversales', duracion: '29 min', file: 'Video Modulo 1  - Tercera Presentación.mp4' },
      { titulo: 'Estrategias de derivación y seguimiento', duracion: '19 min', file: 'Video Modulo 1 - Primera Clase.mp4' },
    ],
  },
  {
    titulo: 'Módulo 4 · Tratamiento y perspectivas',
    videos: [
      { titulo: 'Terapias de reemplazo e inmunomodulación', duracion: '22 min', file: 'Video Modulo 1 - Primera Clase.mp4' },
      { titulo: 'Trasplante y cuidados perioperatorios', duracion: '24 min', file: 'Video Modulo 1  - Segunda Presentación.mov' },
      { titulo: 'Terapia génica e innovación', duracion: '23 min', file: 'Video Modulo 1  - Tercera Presentación.mp4' },
      { titulo: 'Panel de cierre y Q&A final', duracion: '15 min', file: 'Video Modulo 1 - Primera Clase.mp4' },
    ],
  },
]

export default function VerPage() {
  const router = useRouter()
  const { firebaseUser, profile, loading: authLoading } = useAuth()
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'descripcion' | 'ponentes' | 'programa'>('descripcion')
  const [paid, setPaid] = useState(false)
  const [inCart, setInCart] = useState(false)
  const [backendVideoId, setBackendVideoId] = useState<string | null>(null)
  const [activeModulo, setActiveModulo] = useState(0)
  const [activeVideoIdx, setActiveVideoIdx] = useState(0)
  const [openModuloIdx, setOpenModuloIdx] = useState(0)
  const [certUnlocked, setCertUnlocked] = useState(false)
  const [videoMime, setVideoMime] = useState('video/mp4')
  const [playerKey, setPlayerKey] = useState('0-0')

  useEffect(() => {
    const sync = () => {
      try { setCertUnlocked(typeof window !== 'undefined' && sessionStorage.getItem(CERT_PASSED_KEY) === '1') } catch { setCertUnlocked(false) }
    }
    sync()
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!firebaseUser) return
    fetchMyCertificates()
      .then(list => { if (Array.isArray(list) && list.length > 0) setCertUnlocked(true) })
      .catch(() => {})
  }, [authLoading, firebaseUser])

  useEffect(() => {
    if (authLoading) return
    if (!firebaseUser) { router.push('/login'); return }

    setVideoUrl(DEMO_VIDEO)
    setLoading(false)
    setInCart(hasItem(PRODUCT.id))

    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 4500)

    ;(async () => {
      try {
        const videos = await fetchPublishedVideos()
        const video = videos[0] ?? null
        if (!video) return

        setBackendVideoId(video.id)

        const res = await fetchAuth(`/purchases/check/${video.id}`, { signal: ac.signal })
        if (!res.ok) return

        const data = await res.json()
        const hasPurchased = data.purchased === true || data.hasPurchase === true
        setPaid(hasPurchased)
      } catch {
      }
    })()

    return () => {
      clearTimeout(timeout)
      ac.abort()
    }
  }, [authLoading, firebaseUser, router])

  const loadBunnyFallback = useCallback(async () => {
    if (!backendVideoId) return
    const full = await fetchVideoById(backendVideoId)
    const url = normalizeBunnyUrl(full?.url) ?? full?.url
    if (!url) return
    setVideoMime('video/mp4')
    setVideoUrl(url)
    setPlayerKey(`${activeModulo}-${activeVideoIdx}-bunny-${Date.now()}`)
  }, [backendVideoId, activeModulo, activeVideoIdx])

  const selectLesson = useCallback((mi: number, vi: number) => {
    if (!paid) return
    setActiveModulo(mi)
    setActiveVideoIdx(vi)
    setOpenModuloIdx(mi)
    const file = lessonFile(mi, vi, MODULOS_DATA[mi]?.videos[vi]?.file)
    const src = staticVideoPath(file)
    setVideoMime(staticVideoMime(file))
    setVideoUrl(src)
    setPlayerKey(`${mi}-${vi}-${file}`)
  }, [paid])

  useEffect(() => {
    if (!paid) return
    selectLesson(0, 0)
  }, [paid, selectLesson])

  function handleAddToCart() {
    addToCart({ ...PRODUCT, videoId: backendVideoId ?? undefined }, 1)
    setInCart(true)
    router.push('/carrito')
  }

  const displayEmail = profile?.email ?? firebaseUser?.email ?? ''
  const clipActual = MODULOS_DATA[activeModulo]?.videos[activeVideoIdx]

  if (loading || (!firebaseUser && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080f1a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--scai-teal)', borderTopColor: 'transparent' }} />
          <p className="text-white/40 text-sm">Cargando tu acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col text-foreground overflow-hidden">
      <PageBackground />
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 lg:gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-3 text-xs text-white/40 uppercase tracking-wider overflow-hidden">
              <FlaskConical size={11} className="flex-shrink-0" />
              <span className="truncate hidden sm:block">III Jornadas Regionales de Inmunología Clínica</span>
              <span className="truncate sm:hidden">III Jornadas · SCAI</span>
              <ChevronRight size={11} className="flex-shrink-0" />
              <span className="text-white/60 flex-shrink-0">Grabación</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50" style={{ background: 'rgba(8,15,26,0.55)', border: '1px solid rgba(18,180,198,0.12)' }}>

              {!paid && (
                <>
                  <Image
                    src="/sin%20fondo/Inmunoglobulina.png"
                    alt=""
                    width={220}
                    height={220}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 w-40 sm:w-52 opacity-[0.09] pointer-events-none select-none hidden sm:block"
                    aria-hidden
                    unoptimized
                  />
                  <Image
                    src="/sin%20fondo/Inmunoglobulina-IgG.png"
                    alt=""
                    width={180}
                    height={180}
                    className="absolute -left-8 bottom-2 w-28 sm:w-40 opacity-[0.08] pointer-events-none select-none hidden sm:block"
                    aria-hidden
                    unoptimized
                  />
                </>
              )}

              <div className="relative z-10 p-2 sm:p-3">
                <SecureVideoPlayer
                  key={playerKey}
                  videoUrl={videoUrl}
                  mimeType={videoMime}
                  onError={loadBunnyFallback}
                />
              </div>

              {!paid && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-5 sm:p-10">
                  <div
                    className="w-full max-w-md rounded-2xl border p-5 sm:p-6 text-center"
                    style={{ background: 'rgba(8,15,26,0.88)', borderColor: 'rgba(18,180,198,0.28)', backdropFilter: 'blur(4px)' }}
                  >
                    <div
                      className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(18,180,198,0.18)', border: '1px solid rgba(18,180,198,0.3)' }}
                    >
                      <Lock size={20} style={{ color: 'var(--scai-teal)' }} />
                    </div>
                    <p className="text-white font-bold text-base sm:text-lg leading-snug">
                      Agrega el acceso al carrito para ver la grabación completa
                    </p>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      Pago único de $25.000 + IVA · Acceso inmediato tras el pago
                    </p>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white active:scale-[0.98] transition-transform"
                        style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 28px rgba(18,180,198,0.35)' }}
                      >
                        <ShoppingCart size={16} />
                        {inCart ? 'Ir al carrito' : 'Agregar al carrito'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold leading-snug text-white">
                Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad
              </h1>
              {clipActual && paid && (
                <p className="mt-2 text-xs sm:text-sm font-medium" style={{ color: 'var(--scai-teal)' }}>
                  {MODULOS_DATA[activeModulo]?.titulo?.split(' · ')[1] ?? ''} · {clipActual.titulo}
                  <span className="text-white/35 font-normal"> · {clipActual.duracion}</span>
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-white/40">
                <span className="hidden sm:inline">Sociedad Chilena de Alergia e Inmunología · SCAI</span>
                <span className="sm:hidden">SCAI</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={11} /> 19 Jun 2026</span>
                <span>·</span>
                <span>4 módulos · 16 ponentes</span>
                <span>·</span>
                <span>Acreditado CONACEM</span>
              </div>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Link
                  href="/ver/test"
                  className="inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold text-white active:scale-[0.98] transition-transform"
                  style={{ background: 'var(--scai-teal)', boxShadow: '0 8px 24px rgba(18,180,198,0.18)' }}
                >
                  <Award size={16} />
                  Realizar examen
                </Link>
                <a
                  href={certUnlocked ? '/certificado' : undefined}
                  onClick={(e) => { if (!certUnlocked) e.preventDefault() }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold border active:scale-[0.98] transition-transform ${
                    certUnlocked ? 'text-white hover:text-white' : 'text-white/25 cursor-not-allowed'
                  }`}
                  style={{
                    background: certUnlocked ? 'rgba(18,180,198,0.16)' : 'rgba(255,255,255,0.03)',
                    borderColor: certUnlocked ? 'rgba(18,180,198,0.35)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Award size={16} style={{ color: certUnlocked ? 'var(--scai-teal)' : 'rgba(255,255,255,0.25)' }} />
                  Descargar certificado
                </a>
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
                    Esta grabación reúne a 16 especialistas que presentan la fisiopatología, el
                    diagnóstico clínico y de laboratorio, y las estrategias terapéuticas más actualizadas
                    para el manejo de estas condiciones en distintos grupos etarios.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                    {[
                      { label: 'Fecha', value: '19 Jun 2026' },
                      { label: 'Módulos', value: '4' },
                      { label: 'Expositores', value: '16' },
                      { label: 'Idioma', value: 'Español' },
                      { label: 'Modalidad', value: 'Online' },
                      { label: 'Acreditación', value: 'CONACEM' },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-xl p-3 border"
                        style={{ background: 'rgba(18,180,198,0.07)', borderColor: 'rgba(18,180,198,0.15)' }}
                      >
                        <p className="text-white/35 text-xs uppercase tracking-wide">{label}</p>
                        <p className="text-white font-semibold text-sm mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ponentes' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {PONENTES.map(p => (
                    <div key={p.nombre} className="rounded-2xl border p-3 flex flex-col items-center text-center gap-2" style={{ background: 'rgba(14,32,53,0.7)', borderColor: 'rgba(18,180,198,0.15)', backdropFilter: 'blur(6px)' }}>
                      {/daniela/i.test(p.nombre) && /budinich|buchini/i.test(p.nombre) ? (
                        <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border flex-shrink-0" style={{ borderColor: 'rgba(18,180,198,0.3)' }}>
                          <Image src="/doctora-perfil.jpg.jpeg" alt={p.nombre} fill sizes="48px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                          style={{ background: 'rgba(18,180,198,0.15)', borderColor: 'rgba(18,180,198,0.25)', color: 'var(--scai-teal)' }}>
                          {p.avatar}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[11px] sm:text-xs text-white leading-tight">{p.nombre}</p>
                        <p className="text-white/40 text-[10px] sm:text-[11px] mt-0.5 leading-relaxed hidden sm:block">{p.especialidad}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'programa' && (
                <div className="space-y-4">
                  {MODULOS_DATA.map((mod, mi) => (
                    <div key={mi} className="rounded-xl border overflow-hidden" style={{ background: 'rgba(14,32,53,0.7)', borderColor: 'rgba(18,180,198,0.15)', backdropFilter: 'blur(6px)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-2.5"
                        style={{ background: 'rgba(18,180,198,0.1)', color: 'var(--scai-teal)' }}>
                        {mod.titulo}
                      </p>
                      <div className="divide-y" style={{ borderColor: 'rgba(18,180,198,0.08)' }}>
                        {mod.videos.map((v, vi) => {
                          const sel = activeModulo === mi && activeVideoIdx === vi && paid
                          return (
                            <button
                              key={vi}
                              type="button"
                              disabled={!paid}
                              onClick={() => selectLesson(mi, vi)}
                              className={`w-full flex items-center gap-3 p-3 sm:p-3.5 transition-colors text-left ${paid ? 'hover:bg-white/[0.04] cursor-pointer' : 'cursor-default'}`}
                              style={sel ? { background: 'rgba(18,180,198,0.08)', borderLeft: '3px solid var(--scai-teal)' } : {}}
                            >
                              <div
                                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 tabular-nums"
                                style={sel ? { background: 'var(--scai-teal)', color: '#fff' } : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}
                              >
                                {mi + 1}.{vi + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs sm:text-sm font-medium leading-snug ${sel ? 'text-white' : 'text-white/60'}`}>
                                  {v.titulo}
                                </p>
                              </div>
                              <span className="text-xs flex-shrink-0 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                <Clock size={10} />{v.duracion}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-3 lg:space-y-4 lg:sticky lg:top-[76px] h-fit">
            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: 'rgba(14,32,53,0.75)', borderColor: 'rgba(18,180,198,0.2)', backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(18,180,198,0.2)' }}>
                  <User size={15} style={{ color: 'var(--scai-teal)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/40 uppercase tracking-wide">Sesión activa</p>
                  <p className="text-sm text-white font-medium truncate max-w-full">{displayEmail}</p>
                </div>
              </div>
              {paid ? (
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  Acceso completo activo
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 text-xs rounded-xl px-3 py-2 border" style={{ background: 'rgba(18,180,198,0.08)', borderColor: 'rgba(18,180,198,0.2)' }}>
                  <span className="text-white/55">Acceso pendiente</span>
                  <button onClick={handleAddToCart} className="text-xs font-semibold" style={{ color: 'var(--scai-teal)' }}>
                    {inCart ? 'Ver carrito' : 'Agregar'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ background: 'rgba(14,32,53,0.75)', borderColor: 'rgba(18,180,198,0.14)', backdropFilter: 'blur(8px)' }}>
              <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wide">Contenido</h3>
                <span className="text-xs text-white/25">4 módulos · 16 videos</span>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(18,180,198,0.08)' }}>
                {MODULOS_DATA.map((mod, mi) => (
                  <div key={mi}>
                    <button
                      type="button"
                      onClick={() => setOpenModuloIdx(o => o === mi ? -1 : mi)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/5"
                      style={openModuloIdx === mi ? { background: 'rgba(18,180,198,0.08)' } : {}}
                    >
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={paid ? { background: 'rgba(255,255,255,0.1)', color: 'var(--scai-teal)' } : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}>
                        {mi + 1}
                      </div>
                      <span className={`flex-1 text-xs font-semibold leading-snug line-clamp-2 ${paid ? 'text-white/85' : 'text-white/25'}`}>
                        {mod.titulo}
                      </span>
                      <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${openModuloIdx === mi ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.35)' }} />
                    </button>
                    {openModuloIdx === mi && (
                      <div className="pb-2 px-2 space-y-0.5">
                        {mod.videos.map((v, vi) => {
                          const sel = paid && activeModulo === mi && activeVideoIdx === vi
                          return (
                            <button
                              key={vi}
                              type="button"
                              onClick={() => selectLesson(mi, vi)}
                              className={`w-full text-left rounded-xl px-3 py-2.5 flex items-start gap-2.5 transition-colors ${paid ? 'hover:bg-white/[0.04]' : 'cursor-default'}`}
                              style={sel ? { background: 'rgba(18,180,198,0.14)' } : {}}
                            >
                              <span className="text-[10px] font-bold tabular-nums mt-0.5 w-7 flex-shrink-0" style={{ color: sel ? 'var(--scai-teal)' : 'rgba(255,255,255,0.25)' }}>
                                {mi + 1}.{vi + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[11px] leading-snug ${sel ? 'text-white font-medium' : paid ? 'text-white/65' : 'text-white/20'}`}>{v.titulo}</p>
                                <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: sel ? 'var(--scai-teal)' : 'rgba(255,255,255,0.22)' }}>
                                  <Clock size={9} />{v.duracion}
                                </p>
                              </div>
                              {sel && <div className="h-1.5 w-1.5 rounded-full flex-shrink-0 mt-1.5 animate-pulse" style={{ background: 'var(--scai-teal)' }} />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border" style={{ background: 'rgba(14,32,53,0.75)', borderColor: 'rgba(18,180,198,0.14)', backdropFilter: 'blur(8px)' }}>
              <p className="text-xs text-white/40 mb-1 font-semibold uppercase tracking-wide">Organiza</p>
              <p className="text-sm text-white/70">Sociedad Chilena de Alergia e Inmunología</p>
              <p className="text-xs mt-1" style={{ color: 'var(--scai-teal)' }}>www.scai.cl · @scai.cl</p>
            </div>

            <Link href="/ver/test" className="w-full flex items-center justify-center gap-2 border text-white/70 hover:text-white text-sm font-medium py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(18,180,198,0.1)', borderColor: 'rgba(18,180,198,0.25)', backdropFilter: 'blur(8px)' }}>
              <Award size={15} style={{ color: 'var(--scai-teal)' }} />
              Realizar examen
            </Link>

            <a
              href={certUnlocked ? '/certificado' : undefined}
              onClick={(e) => { if (!certUnlocked) e.preventDefault() }}
              className={`w-full flex items-center justify-center gap-2 border text-sm font-medium py-3 rounded-xl transition-all active:scale-95 ${certUnlocked ? 'text-white hover:text-white' : 'text-white/25 cursor-not-allowed'}`}
              style={{ background: certUnlocked ? 'rgba(18,180,198,0.16)' : 'rgba(255,255,255,0.03)', borderColor: certUnlocked ? 'rgba(18,180,198,0.35)' : 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
            >
              <Award size={15} style={{ color: certUnlocked ? 'var(--scai-teal)' : 'rgba(255,255,255,0.25)' }} />
              Descargar certificado
            </a>

            <div className="rounded-2xl p-4 border" style={{ background: 'rgba(14,32,53,0.5)', borderColor: 'rgba(18,180,198,0.08)', backdropFilter: 'blur(8px)' }}>
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
