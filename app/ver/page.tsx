'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Award, ChevronRight, FlaskConical, ShoppingCart, Lock, User, ChevronDown, Play, ChevronUp } from 'lucide-react'
import SecureVideoPlayer from '@/components/SecureVideoPlayer'
import PageBackground from '@/components/PageBackground'
import Image from 'next/image'
import { addToCart, hasItem } from '@/lib/cart'
import { useAuth } from '@/lib/authContext'
import { auth } from '@/lib/firebase'
import { getCachedPurchase, setCachedPurchase } from '@/lib/api'
import { DEFAULT_COURSE_ID, resolveCourseAccess, type Course } from '@/lib/courses'
import { waitForFirebaseUser } from '@/lib/auth'
import { buildCourseLessons, type LessonModulo } from '@/lib/bunnyLessons'
import { useLessonPlayer } from '@/lib/useLessonPlayer'
import { CERT_PASSED_KEY } from '@/lib/certTest'
import { PONENTES, ponenteFoto, ponenteIniciales } from '@/lib/ponentes'

const PRODUCT = {
  id: DEFAULT_COURSE_ID,
  title: 'III Jornadas Regionales de Inmunología Clínica',
  subtitle: 'Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad',
  priceNeto: 30000,
}

const FALLBACK_MODULOS: LessonModulo[] = buildCourseLessons([]).modulos

function applyLessons(
  course: Course | null | undefined,
  setModulos: (m: LessonModulo[]) => void,
  setLessonMap: (m: Record<string, string>) => void,
  withPlayback: boolean,
) {
  const built = buildCourseLessons(course?.videos ?? [])
  if (!built.modulos.length) return
  setModulos(built.modulos)
  setLessonMap(withPlayback ? built.lessonMap : {})
}

export default function VerPage() {
  const router = useRouter()
  const { firebaseUser, profile, loading: authLoading } = useAuth()
  const activeUser = firebaseUser ?? auth?.currentUser ?? null
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'descripcion' | 'ponentes' | 'programa'>('descripcion')
  const [paid, setPaid] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [mobileListOpen, setMobileListOpen] = useState(false)
  const [inCart, setInCart] = useState(false)
  const [courseId, setCourseId] = useState<string | null>(DEFAULT_COURSE_ID)
  const coursePrice = PRODUCT.priceNeto
  const [certUnlocked, setCertUnlocked] = useState(false)
  const [modulos, setModulos] = useState<LessonModulo[]>(FALLBACK_MODULOS)
  const [lessonMap, setLessonMap] = useState<Record<string, string>>({})

  const {
    activeModulo,
    activeVideoIdx,
    openModuloIdx,
    setOpenModuloIdx,
    videoUrl,
    videoMime,
    playerKey,
    selectLesson,
    hasPlayback,
    onVideoError,
    buffering,
    onPlayerReady,
  } = useLessonPlayer(paid, lessonMap)

  const totalVideos = modulos.reduce((n, m) => n + m.videos.length, 0)

  useEffect(() => {
    const sync = () => {
      try { setCertUnlocked(sessionStorage.getItem(CERT_PASSED_KEY) === '1') } catch { setCertUnlocked(false) }
    }
    sync()
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!activeUser) {
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('__tauren_session=')
      if (!hasCookie) {
        router.replace('/login')
        return
      }
      let cancelled = false
      waitForFirebaseUser(2500)
        .catch(() => {})
        .finally(() => {
          if (!cancelled && !auth?.currentUser) router.replace('/login')
        })
      return () => { cancelled = true }
    }

    setLoading(false)
    const id = DEFAULT_COURSE_ID
    setCourseId(id)
    setInCart(hasItem(id))
    let cancelled = false

    if (getCachedPurchase(id) === true) {
      setPaid(true)
      setCheckingAccess(false)
    }

    resolveCourseAccess(id, activeUser)
      .then(access => {
        if (cancelled) return
        if (!access.ok) {
          setCheckingAccess(false)
          if ('unauthorized' in access) router.replace('/login')
          return
        }
        setCachedPurchase(id, access.paid)
        setPaid(access.paid)
        if (access.paid && 'course' in access) {
          applyLessons(access.course, setModulos, setLessonMap, true)
        } else {
          setLessonMap({})
        }
        setCheckingAccess(false)
      })
      .catch(() => { if (!cancelled) setCheckingAccess(false) })

    return () => { cancelled = true }
  }, [authLoading, activeUser, router])

  function handleAddToCart() {
    const id = courseId ?? PRODUCT.id
    addToCart({
      id,
      courseId: courseId ?? undefined,
      title: PRODUCT.title,
      subtitle: PRODUCT.subtitle,
      priceNeto: coursePrice,
    }, 1)
    setInCart(true)
    router.push('/carrito')
  }

  const displayEmail = profile?.email ?? activeUser?.email ?? ''
  const clipActual = modulos[activeModulo]?.videos[activeVideoIdx]

  if (loading || (!activeUser && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 animate-spin border-[color:var(--scai-teal)] border-t-transparent" />
          <p className="text-muted-foreground text-sm">Cargando tu acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col text-foreground overflow-hidden">
      <PageBackground scene="ver" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 lg:gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground dark:text-white/40 uppercase tracking-wider overflow-hidden">
              <FlaskConical size={11} className="flex-shrink-0" />
              <span className="truncate hidden sm:block">III Jornadas Regionales de Inmunología Clínica</span>
              <span className="truncate sm:hidden">III Jornadas · SCAI</span>
              <ChevronRight size={11} className="flex-shrink-0" />
              <span className="text-foreground/70 dark:text-white/60 flex-shrink-0">Grabación</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/50 border border-border bg-card dark:bg-[rgba(8,15,26,0.55)]">
              <div className="relative z-10 p-2 sm:p-3">
                {buffering && paid && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 dark:bg-black/40 pointer-events-none">
                    <div className="h-8 w-8 rounded-full border-2 border-border border-t-[color:var(--scai-teal)] animate-spin" />
                  </div>
                )}
                {paid ? (
                  <SecureVideoPlayer
                    key={playerKey}
                    videoUrl={videoUrl}
                    mimeType={videoMime}
                    poster={clipActual?.thumbnail}
                    onError={onVideoError}
                    onReady={onPlayerReady}
                  />
                ) : (
                  <div className="relative w-full overflow-hidden rounded-xl bg-[#0B1928]" style={{ aspectRatio: '16/9' }}>
                    <Image
                      src="/imagenes/Inmunoglobulina adeherida.jpg"
                      alt=""
                      fill
                      className="object-cover object-[50%_85%] opacity-35"
                      sizes="(max-width: 768px) 100vw, 60vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1928]/90 via-[#0B1928]/50 to-[#0B1928]/30" />
                  </div>
                )}
              </div>

              {!paid && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-5 sm:p-10">
                  <div className="w-full max-w-md rounded-2xl border border-border p-5 sm:p-6 text-center bg-card dark:bg-[rgba(8,15,26,0.88)] shadow-xl">
                    {checkingAccess ? (
                      <>
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center bg-primary/15 border border-primary/30">
                          <div className="h-5 w-5 rounded-full border-2 border-[color:var(--scai-teal)] border-t-transparent animate-spin" />
                        </div>
                        <p className="text-foreground dark:text-white font-bold text-base sm:text-lg leading-snug">
                          Verificando tu acceso...
                        </p>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground dark:text-white/45">
                          Espera un momento
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center bg-primary/15 border border-primary/30">
                          <Lock size={20} style={{ color: 'var(--scai-teal)' }} />
                        </div>
                        <p className="text-foreground dark:text-white font-bold text-base sm:text-lg leading-snug">
                          Agrega el acceso al carrito para ver la grabación completa
                        </p>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground dark:text-white/45">
                          Pago único de $30.000 · Acceso inmediato
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
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {paid && (
              <div className="lg:hidden mt-3 rounded-2xl border border-border bg-card dark:bg-[rgba(14,32,53,0.85)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileListOpen(o => !o)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 active:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/15">
                      <Play size={12} style={{ color: 'var(--scai-teal)' }} fill="currentColor" className="ml-0.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground dark:text-white/40">Reproduciendo</p>
                      <p className="text-xs font-semibold text-foreground dark:text-white truncate">
                        {clipActual?.titulo ?? 'Selecciona un video'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground dark:text-white/30">{modulos[activeModulo]?.titulo?.split(' · ')[0] ?? ''}</span>
                    {mobileListOpen ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
                  </div>
                </button>
                {mobileListOpen && (
                  <div className="border-t border-border max-h-64 overflow-y-auto overscroll-contain">
                    {modulos.map((mod, mi) => (
                      <div key={mi}>
                        <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-secondary/60 dark:bg-white/[0.03] text-muted-foreground dark:text-white/30">
                          {mod.titulo}
                        </p>
                        {mod.videos.map((v, vi) => {
                          const sel = activeModulo === mi && activeVideoIdx === vi
                          const canPlay = hasPlayback(mi, vi) && !v.soon
                          return (
                            <button
                              key={v.id ?? vi}
                              type="button"
                              disabled={!canPlay}
                              onClick={() => { selectLesson(mi, vi); setMobileListOpen(false) }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-b-0 ${
                                canPlay ? 'active:bg-accent/40' : 'opacity-40'
                              } ${sel ? 'bg-primary/10 dark:bg-[rgba(18,180,198,0.1)]' : ''}`}
                            >
                              <div className="relative h-10 w-16 rounded-md overflow-hidden flex-shrink-0 bg-secondary dark:bg-white/10">
                                {v.thumbnail ? (
                                  <Image src={v.thumbnail} alt="" fill sizes="64px" className="object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                    {String(v.numero).padStart(2, '0')}
                                  </div>
                                )}
                                {sel && (
                                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                    <Play size={12} className="text-white fill-white ml-0.5" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium leading-snug truncate ${sel ? 'text-foreground dark:text-white' : 'text-foreground/75 dark:text-white/55'}`}>
                                  {v.titulo}
                                </p>
                                <p className="text-[10px] text-muted-foreground dark:text-white/25 truncate mt-0.5">
                                  {v.ponente ? `${v.ponente} · ` : ''}<span className="inline-flex items-center gap-1"><Clock size={8} />{v.duracion}</span>
                                </p>
                              </div>
                              {sel && <div className="h-1.5 w-1.5 rounded-full bg-[color:var(--scai-teal)] animate-pulse flex-shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold leading-snug text-foreground dark:text-white">
                Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad
              </h1>
              {clipActual && paid && (
                <p className="mt-2 text-xs sm:text-sm font-medium" style={{ color: 'var(--scai-teal)' }}>
                  {String(clipActual.numero).padStart(2, '0')} · {clipActual.titulo}
                  {clipActual.ponente ? <span className="text-muted-foreground dark:text-white/35 font-normal"> · {clipActual.ponente}</span> : null}
                  <span className="text-muted-foreground dark:text-white/35 font-normal"> · {clipActual.duracion}</span>
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground dark:text-white/40">
                <span className="hidden sm:inline">Sociedad Chilena de Alergia e Inmunología · SCAI</span>
                <span className="sm:hidden">SCAI</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={11} /> 19 Jun 2026</span>
                <span>·</span>
                <span>4 módulos · 15 ponentes</span>
                <span>·</span>
                <span>Acreditado CONACEM</span>
              </div>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Link
                  href="/ver/test"
                  prefetch={false}
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
                    certUnlocked
                      ? 'border-[color:rgba(18,180,198,0.45)] bg-primary/15 text-foreground dark:text-white'
                      : 'border-border bg-secondary/50 text-muted-foreground/50 cursor-not-allowed'
                  }`}
                >
                  <Award size={16} style={{ color: certUnlocked ? 'var(--scai-teal)' : undefined }} className={certUnlocked ? '' : 'opacity-40'} />
                  Descargar certificado
                </a>
              </div>
            </div>

            <div className="mt-4 flex gap-0.5 border-b border-border overflow-x-auto scrollbar-none">
              {([
                { key: 'descripcion', label: 'Descripción' },
                { key: 'ponentes', label: 'Expositores' },
                { key: 'programa', label: 'Programa' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${
                    activeTab === key
                      ? 'text-foreground dark:text-white border-[color:var(--scai-teal)]'
                      : 'border-transparent text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {activeTab === 'descripcion' && (
                <div className="space-y-3 text-muted-foreground dark:text-white/60 text-sm leading-relaxed max-w-2xl">
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
                      { label: 'Módulos', value: '4' },
                      { label: 'Expositores', value: '15' },
                      { label: 'Idioma', value: 'Español' },
                      { label: 'Modalidad', value: 'Online' },
                      { label: 'Acreditación', value: 'CONACEM' },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-xl p-3 border border-border bg-secondary/80 dark:bg-[rgba(18,180,198,0.07)] dark:border-[rgba(18,180,198,0.15)]"
                      >
                        <p className="text-muted-foreground dark:text-white/35 text-xs uppercase tracking-wide">{label}</p>
                        <p className="text-foreground dark:text-white font-semibold text-sm mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ponentes' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {PONENTES.map(p => {
                    const foto = ponenteFoto(p.nombre)
                    return (
                    <div key={p.nombre} className="rounded-2xl border border-border p-3 flex flex-col items-center text-center gap-2 bg-card shadow-sm dark:bg-[rgba(14,32,53,0.7)] dark:backdrop-blur-sm">
                      {foto ? (
                        <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border border-border dark:border-[rgba(18,180,198,0.3)] flex-shrink-0">
                          <Image src={foto} alt={p.nombre} fill sizes="128px" quality={100} className="object-cover object-top" />
                        </div>
                      ) : (
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border border-primary/30 flex items-center justify-center font-bold text-sm flex-shrink-0 bg-primary/10 text-[color:var(--scai-teal)]">
                          {ponenteIniciales(p.nombre)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[11px] sm:text-xs text-foreground dark:text-white leading-tight">{p.nombre}</p>
                        <p className="text-muted-foreground dark:text-white/40 text-[10px] sm:text-[11px] mt-0.5 leading-relaxed hidden sm:block">{p.cargo}</p>
                      </div>
                    </div>
                  )})}
                </div>
              )}

              {activeTab === 'programa' && (
                <div className="space-y-4">
                  {modulos.map((mod, mi) => (
                    <div key={mi} className="rounded-xl border border-border overflow-hidden bg-card shadow-sm dark:bg-[rgba(14,32,53,0.7)] dark:backdrop-blur-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-2.5 bg-secondary dark:bg-[rgba(18,180,198,0.1)] text-[color:var(--scai-teal)]">
                        {mod.titulo}
                      </p>
                      <div className="divide-y divide-border dark:divide-[rgba(18,180,198,0.08)]">
                        {mod.videos.map((v, vi) => {
                          const sel = activeModulo === mi && activeVideoIdx === vi && paid
                          const canPlay = paid && hasPlayback(mi, vi) && !v.soon
                          return (
                            <button
                              key={v.id ?? vi}
                              type="button"
                              disabled={!canPlay}
                              onClick={() => selectLesson(mi, vi)}
                              className={`w-full flex items-center gap-3 p-3 sm:p-3.5 transition-colors text-left ${
                                canPlay ? 'hover:bg-accent/40 dark:hover:bg-white/[0.04] cursor-pointer' : 'cursor-default opacity-45'
                              } ${sel ? 'bg-primary/10 dark:bg-[rgba(18,180,198,0.08)] border-l-[3px] border-l-[color:var(--scai-teal)]' : ''}`}
                            >
                              <div className="relative h-11 w-[4.5rem] rounded-lg overflow-hidden flex-shrink-0 bg-secondary dark:bg-white/10">
                                {v.thumbnail ? (
                                  <Image src={v.thumbnail} alt="" fill sizes="72px" className="object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                    {String(v.numero).padStart(2, '0')}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs sm:text-sm font-medium leading-snug ${sel ? 'text-foreground dark:text-white' : 'text-muted-foreground dark:text-white/60'}`}>
                                  {v.titulo}
                                </p>
                                {v.ponente && (
                                  <p className="text-[10px] sm:text-xs text-muted-foreground/80 dark:text-white/35 mt-0.5 truncate">
                                    {v.ponente}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs flex-shrink-0 flex items-center gap-1 text-muted-foreground/70 dark:text-white/25">
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

          <aside className="hidden lg:block space-y-3 lg:space-y-4 lg:sticky lg:top-[76px] h-fit">
            <div className="rounded-2xl p-4 sm:p-5 border border-border bg-card shadow-sm dark:bg-[rgba(14,32,53,0.75)] dark:backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/15">
                  <User size={15} style={{ color: 'var(--scai-teal)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground dark:text-white/40 uppercase tracking-wide">Sesión activa</p>
                  <p className="text-sm text-foreground dark:text-white font-medium truncate max-w-full">{displayEmail}</p>
                </div>
              </div>
              {checkingAccess ? (
                <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2 border border-border bg-secondary/80 dark:bg-[rgba(18,180,198,0.08)] dark:border-[rgba(18,180,198,0.2)]">
                  <div className="h-3 w-3 rounded-full border border-[color:var(--scai-teal)] border-t-transparent animate-spin flex-shrink-0" />
                  <span className="text-muted-foreground dark:text-white/55">Verificando acceso...</span>
                </div>
              ) : paid ? (
                <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-500/15 dark:bg-green-500/10 border border-green-500/25 dark:border-green-500/20 rounded-xl px-3 py-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse flex-shrink-0" />
                  Acceso completo activo
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 text-xs rounded-xl px-3 py-2 border border-border bg-secondary/80 dark:bg-[rgba(18,180,198,0.08)] dark:border-[rgba(18,180,198,0.2)]">
                  <span className="text-muted-foreground dark:text-white/55">Acceso pendiente</span>
                  <button onClick={handleAddToCart} className="text-xs font-semibold" style={{ color: 'var(--scai-teal)' }}>
                    {inCart ? 'Ver carrito' : 'Agregar'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-sm dark:bg-[rgba(14,32,53,0.75)] dark:backdrop-blur-md">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-muted-foreground dark:text-white/50 uppercase tracking-wide">Contenido</h3>
                <span className="text-xs text-muted-foreground/70 dark:text-white/25">{modulos.length} módulos · {totalVideos} videos</span>
              </div>
              <div className="divide-y divide-border dark:divide-[rgba(18,180,198,0.08)]">
                {modulos.map((mod, mi) => (
                  <div key={mod.numero}>
                    <button
                      type="button"
                      onClick={() => setOpenModuloIdx(o => o === mi ? -1 : mi)}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-accent/40 dark:hover:bg-white/5 ${openModuloIdx === mi ? 'bg-primary/10 dark:bg-[rgba(18,180,198,0.08)]' : ''}`}
                    >
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        paid ? 'bg-secondary dark:bg-white/10 text-[color:var(--scai-teal)]' : 'bg-muted dark:bg-white/5 text-muted-foreground dark:text-white/20'
                      }`}>
                        {mod.numero}
                      </div>
                      <span className={`flex-1 text-xs font-semibold leading-snug line-clamp-2 ${paid ? 'text-foreground/90 dark:text-white/85' : 'text-muted-foreground/50 dark:text-white/25'}`}>
                        {mod.titulo}
                      </span>
                      <ChevronDown size={16} className={`flex-shrink-0 transition-transform text-muted-foreground dark:text-white/35 ${openModuloIdx === mi ? 'rotate-180' : ''}`} />
                    </button>
                    {openModuloIdx === mi && (
                      <div className="pb-2 px-2 space-y-0.5">
                        {mod.videos.map((v, vi) => {
                          const sel = paid && activeModulo === mi && activeVideoIdx === vi
                          const canPlay = paid && hasPlayback(mi, vi) && !v.soon
                          return (
                            <button
                              key={v.id ?? vi}
                              type="button"
                              disabled={!canPlay}
                              onClick={() => selectLesson(mi, vi)}
                              className={`w-full text-left rounded-xl px-3 py-2.5 flex items-start gap-2.5 transition-colors ${
                                canPlay ? 'hover:bg-accent/40 dark:hover:bg-white/[0.04] cursor-pointer' : 'cursor-default opacity-45'
                              } ${sel ? 'bg-primary/15 dark:bg-[rgba(18,180,198,0.14)]' : ''}`}
                            >
                              <div className="relative h-10 w-[3.75rem] rounded-md overflow-hidden flex-shrink-0 bg-secondary dark:bg-white/10">
                                {v.thumbnail ? (
                                  <Image src={v.thumbnail} alt="" fill sizes="60px" className="object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                                    {String(v.numero).padStart(2, '0')}
                                  </div>
                                )}
                                {sel && (
                                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                    <Play size={11} className="text-white fill-white ml-0.5" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[11px] leading-snug ${sel ? 'text-foreground dark:text-white font-medium' : paid ? 'text-foreground/80 dark:text-white/65' : 'text-muted-foreground/50 dark:text-white/20'}`}>{v.titulo}</p>
                                {v.ponente && (
                                  <p className={`text-[10px] mt-0.5 truncate ${sel ? 'text-[color:var(--scai-teal)]' : 'text-muted-foreground/70 dark:text-white/22'}`}>
                                    {v.ponente}
                                  </p>
                                )}
                                <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${sel ? 'text-[color:var(--scai-teal)]' : 'text-muted-foreground/70 dark:text-white/22'}`}>
                                  <Clock size={9} />{v.duracion}
                                </p>
                              </div>
                              {sel && <div className="h-1.5 w-1.5 rounded-full flex-shrink-0 mt-1.5 animate-pulse bg-[color:var(--scai-teal)]" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4 sm:p-5 border border-border bg-card shadow-sm dark:bg-[rgba(14,32,53,0.75)] dark:backdrop-blur-md">
              <p className="text-xs text-muted-foreground dark:text-white/40 mb-1 font-semibold uppercase tracking-wide">Organiza</p>
              <p className="text-sm text-foreground/80 dark:text-white/70">Sociedad Chilena de Alergia e Inmunología</p>
              <p className="text-xs mt-1 text-[color:var(--scai-teal)]">www.scai.cl · @scai.cl</p>
            </div>

            <Link href="/ver/test" prefetch={false} className="w-full flex items-center justify-center gap-2 border border-primary/35 bg-card text-foreground hover:bg-primary/10 dark:bg-primary/10 dark:text-white/70 dark:hover:bg-primary/15 dark:hover:text-white text-sm font-medium py-3 rounded-xl transition-all active:scale-95 shadow-sm">
              <Award size={15} style={{ color: 'var(--scai-teal)' }} />
              Realizar examen
            </Link>

            <a
              href={certUnlocked ? '/certificado' : undefined}
              onClick={(e) => { if (!certUnlocked) e.preventDefault() }}
              className={`w-full flex items-center justify-center gap-2 border text-sm font-medium py-3 rounded-xl transition-all active:scale-95 shadow-sm ${
                certUnlocked
                  ? 'border-primary/45 bg-card text-foreground hover:bg-primary/10 dark:bg-primary/15 dark:text-white'
                  : 'border-border bg-secondary text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Award size={16} className={certUnlocked ? '' : 'opacity-40'} style={{ color: certUnlocked ? 'var(--scai-teal)' : undefined }} />
              Descargar certificado
            </a>

            <div className="rounded-2xl p-4 border border-border bg-card/95 shadow-sm dark:bg-[rgba(14,32,53,0.5)] dark:backdrop-blur-md">
              <p className="text-xs text-muted-foreground/70 dark:text-white/20 leading-relaxed text-center">
                Contenido protegido. Prohibida la grabación y distribución no autorizada.
              </p>
            </div>
          </aside>
        </div>
      </main>

    </div>
  )
}
