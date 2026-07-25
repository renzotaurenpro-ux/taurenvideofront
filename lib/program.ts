export type ProgramSlot = {
  numero: number
  modulo: number
  ponente: string
  cargo: string
  titulo: string
  match: RegExp[]
}

export const PROGRAM_EXPOSITORES = 15

export const PROGRAM_MODULO_TITLES: Record<number, string> = {
  0: 'Apertura · Bienvenida',
  1: 'Módulo 1 · Sospecha clínica y anticuerpos',
  2: 'Módulo 2 · Neutrófilos, dismorfias y autoinflamatorios',
  3: 'Módulo 3 · Manifestaciones y desregulación',
  4: 'Módulo 4 · Laboratorio, genética e inmunoglobulina',
}

export const PROGRAM_SLOTS: ProgramSlot[] = [
  {
    numero: 0,
    modulo: 0,
    ponente: 'Dra. Carla Bastias · Dra. Ligia Rodríguez',
    cargo: 'Vicepresidenta SCAI · Directora RRSS / Regional SCAI',
    titulo: 'Bienvenida a las Jornadas Regionales',
    match: [/bienvenida/i, /carla\s*bastias/i],
  },
  {
    numero: 1,
    modulo: 1,
    ponente: 'Dra. Soledad Pérez Saldías',
    cargo: 'Inmunóloga - Hospital Villarrica',
    titulo: 'Cuándo Sospechar Errores Innatos de la Inmunidad: Derivación a Especialidad',
    match: [/\b0?1\b/, /soledad/i, /p[eé]rez/i],
  },
  {
    numero: 2,
    modulo: 1,
    ponente: 'Dra. Daniela Budinich Almarza',
    cargo: 'Inmunóloga - Hospital Villarrica',
    titulo: 'Abordaje de infecciones recurrentes en pediatría',
    match: [/\b0?2\b/, /daniela/i, /budinich/i],
  },
  {
    numero: 3,
    modulo: 1,
    ponente: 'Dr. Francisco Roa',
    cargo: 'Inmunólogo - Hospital de Concepción',
    titulo: 'Inmunodeficiencias Predominantemente de Anticuerpos',
    match: [/\b0?3\b/, /francisco\s*roa/i, /\broa\b/i],
  },
  {
    numero: 4,
    modulo: 1,
    ponente: 'Dra. María de los Ángeles Morales',
    cargo: 'Inmunóloga - Hospital de Coquimbo',
    titulo: 'Vacunas y Errores Innatos de la Inmunidad',
    match: [/\b0?4\b/, /morales/i, /angeles/i, /ángeles/i],
  },
  {
    numero: 5,
    modulo: 2,
    ponente: 'Dra. Bárbara Cid Troncoso',
    cargo: 'Inmunóloga - Hospital de Osorno',
    titulo: 'Defectos del neutrófilo',
    match: [/\b0?5\b/, /b[aá]rbara/i, /\bcid\b/i],
  },
  {
    numero: 6,
    modulo: 2,
    ponente: 'Dra. Ligia Rodríguez',
    cargo: 'Inmunóloga - Hospital de Antofagasta',
    titulo: 'Dismorfias Faciales y 22q11.2',
    match: [/\b0?6\b/, /ligia/i, /rodr[ií]guez/i, /22q11/i, /dismorf/i],
  },
  {
    numero: 7,
    modulo: 2,
    ponente: 'Dr. Mervin Piñones',
    cargo: 'Inmunólogo - Hospital de Concepción',
    titulo: 'Síndromes Autoinflamatorios: ¿Cuándo Sospechar?',
    match: [/\b0?7\b/, /mervin/i, /pi[nñ]ones/i, /autoinflam/i],
  },
  {
    numero: 8,
    modulo: 3,
    ponente: 'Dra. Patricia Vergara',
    cargo: 'Dermatóloga - Bioreuma Concepción',
    titulo: 'Manifestaciones cutáneas no infecciosas en Errores Innatos de la Inmunidad',
    match: [/\b0?8\b/, /patricia/i, /vergara/i],
  },
  {
    numero: 9,
    modulo: 3,
    ponente: 'Dr. Nicolás Faundes',
    cargo: 'Inmunólogo - Hospital de Viña del Mar',
    titulo: 'Síndrome Hiper Inmunoglobulina E',
    match: [/\b0?9\b/, /nicol[aá]s/i, /fa[uú]ndes/i],
  },
  {
    numero: 10,
    modulo: 3,
    ponente: 'Dra. Ilennee Diaz',
    cargo: 'Inmunóloga - Hospital de Los Ángeles',
    titulo: 'Desregulación Inmune',
    match: [/\b10\b/, /ilenne/i, /d[ií]az/i],
  },
  {
    numero: 11,
    modulo: 3,
    ponente: 'Dra. Lurimar Manrique',
    cargo: 'Inmunóloga - Hospital de Ovalle',
    titulo: 'Angioedema Hereditario',
    match: [/\b11\b/, /lurimar/i, /manrique/i],
  },
  {
    numero: 12,
    modulo: 4,
    ponente: 'Dra. Pamela Méndez',
    cargo: 'Inmunóloga - Hospital de Temuco',
    titulo: 'Laboratorio en Errores innatos de la Inmunidad',
    match: [/\b12\b/, /pamela/i, /m[eé]ndez/i],
  },
  {
    numero: 13,
    modulo: 4,
    ponente: 'Dr. Francisco Cammarata',
    cargo: 'Genetista - Hospital de Antofagasta',
    titulo: 'Asesoramiento Genético y Principios Bioéticos en Errores Innatos de la Inmunidad',
    match: [/\b13\b/, /cammarata/i],
  },
  {
    numero: 14,
    modulo: 4,
    ponente: 'Dra. Fabiola Fernández Quezada',
    cargo: 'Inmunóloga - Hospital de Chillán',
    titulo: 'Uso de Inmunoglobulina en Errores Innatos de la Inmunidad',
    match: [/\b14\b/, /fabiola/i, /fern[aá]ndez/i],
  },
  {
    numero: 15,
    modulo: 4,
    ponente: 'Dr. Alfonso Hernández',
    cargo: 'Inmunólogo - Hospital de Temuco',
    titulo: 'Manifestaciones no Infecciosas en Errores Innatos de la Inmunidad',
    match: [/\b15\b/, /alfonso/i, /hern[aá]ndez/i],
  },
]

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function matchProgramSlot(title: string): ProgramSlot | null {
  const raw = title || ''
  const norm = normalizeText(raw)

  const byNumber = raw.match(/^\s*(\d{1,2})\b/)
  if (byNumber) {
    const n = parseInt(byNumber[1], 10)
    const slot = PROGRAM_SLOTS.find(s => s.numero === n)
    if (slot) return slot
  }

  let best: ProgramSlot | null = null
  let bestScore = 0
  for (const slot of PROGRAM_SLOTS) {
    let score = 0
    for (const re of slot.match) {
      if (re.test(raw) || re.test(norm)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = slot
    }
  }
  return bestScore >= 2 ? best : null
}
