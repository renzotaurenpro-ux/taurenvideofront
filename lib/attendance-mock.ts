import {
  ATTENDANCE_EXAM_MAX_GRADE,
  ATTENDANCE_EXAM_PASS_GRADE,
  calcAttendanceExamGrade,
  passesAttendanceExamGrade,
} from './attendance-exam'

const EVENT = {
  organization: 'SOCIEDAD CHILENA DE ALERGIA E INMUNOLOGÍA',
  type: 'CERTIFICADO DE ASISTENCIA',
  eventTitle: 'III Jornadas Regionales de Inmunología Clínica',
  eventSubtitle: 'Cuando el Sistema Inmune Falla: Desafíos en Errores Innatos de la Inmunidad',
  eventDate: '19 de junio de 2026',
  modality: 'online',
  director1: 'Dra. Rocío Tordecilla Fernández',
  director1Role: 'Directora Sociedad Chilena de Alergía e Inmunología',
  director2: 'Dra. Ligia Rodríguez Alvarez',
  director2Role: 'Directora de Redes Sociales y Regional de SCAI',
}

type MockAttendee = {
  firstName: string
  lastName: string
  watchedOver80: boolean
}

type MockCertificate = {
  certificateCode: string
  certificateType: 'LIVE_VIEWING' | 'EXAM'
  certificateTitle: string
  certificateLabel: string
  issuedAt: string
  recipient: {
    firstName: string
    lastName: string
    fullName: string
    email: string
  }
  event: typeof EVENT
}

type MockUserState = {
  viewing?: MockCertificate
  exam?: MockCertificate
  examPassed?: boolean
}

const ATTENDEES: Record<string, MockAttendee> = {
  'asistio-con-80@test-scai.cl': {
    firstName: 'Ana',
    lastName: 'ConOchenta',
    watchedOver80: true,
  },
  'asistio-sin-80@test-scai.cl': {
    firstName: 'Pedro',
    lastName: 'SinOchenta',
    watchedOver80: false,
  },
}

const MOCK_EXAM = {
  id: 'mock-attendance-exam',
  title: 'Test de asistencia - III Jornadas Regionales de Inmunología Clínica',
  passingScore: 5,
  questions: [
    {
      id: 'mock-q1',
      text: '¿Qué son los errores innatos de la inmunidad?',
      order: 1,
      options: [
        { id: 'mock-q1-a', text: 'Defectos genéticos del sistema inmune' },
        { id: 'mock-q1-b', text: 'Infecciones adquiridas en la adultez' },
        { id: 'mock-q1-c', text: 'Alergias estacionales' },
        { id: 'mock-q1-d', text: 'Reacciones autoinmunes leves' },
      ],
    },
    {
      id: 'mock-q2',
      text: '¿Cuál es un signo de alerta en inmunodeficiencia primaria?',
      order: 2,
      options: [
        { id: 'mock-q2-a', text: 'Infecciones recurrentes o severas' },
        { id: 'mock-q2-b', text: 'Un resfriado anual' },
        { id: 'mock-q2-c', text: 'Fatiga ocasional' },
        { id: 'mock-q2-d', text: 'Dolor muscular leve' },
      ],
    },
    {
      id: 'mock-q3',
      text: 'La inmunoglobulina sustitutiva se usa principalmente en:',
      order: 3,
      options: [
        { id: 'mock-q3-a', text: 'Deficiencias de anticuerpos' },
        { id: 'mock-q3-b', text: 'Hipertensión arterial' },
        { id: 'mock-q3-c', text: 'Diabetes tipo 2' },
        { id: 'mock-q3-d', text: 'Asma leve intermitente' },
      ],
    },
    {
      id: 'mock-q4',
      text: 'El diagnóstico temprano de EII permite:',
      order: 4,
      options: [
        { id: 'mock-q4-a', text: 'Mejor pronóstico y tratamiento oportuno' },
        { id: 'mock-q4-b', text: 'Evitar toda medicación' },
        { id: 'mock-q4-c', text: 'Suspender vacunación' },
        { id: 'mock-q4-d', text: 'No requiere seguimiento' },
      ],
    },
    {
      id: 'mock-q5',
      text: 'La modalidad del evento fue:',
      order: 5,
      options: [
        { id: 'mock-q5-a', text: 'Online' },
        { id: 'mock-q5-b', text: 'Presencial únicamente' },
        { id: 'mock-q5-c', text: 'Híbrido obligatorio' },
        { id: 'mock-q5-d', text: 'Sin transmisión' },
      ],
    },
  ],
}

const MOCK_CORRECT: Record<string, string> = {
  'mock-q1': 'mock-q1-a',
  'mock-q2': 'mock-q2-a',
  'mock-q3': 'mock-q3-a',
  'mock-q4': 'mock-q4-a',
  'mock-q5': 'mock-q5-a',
}

type MockStore = Map<string, MockUserState>

function getStore(): MockStore {
  const g = globalThis as typeof globalThis & { __attendanceMockStoreV2?: MockStore }
  if (!g.__attendanceMockStoreV2) g.__attendanceMockStoreV2 = new Map()
  return g.__attendanceMockStoreV2
}

function getAttendee(email: string) {
  return ATTENDEES[email.trim().toLowerCase()]
}

function getUserState(email: string) {
  const store = getStore()
  const normalized = email.trim().toLowerCase()
  if (!store.has(normalized)) store.set(normalized, {})
  return store.get(normalized)!
}

function certMeta(certificateType: 'LIVE_VIEWING' | 'EXAM') {
  if (certificateType === 'EXAM') {
    return {
      certificateTitle: 'Certificado de Examen del Evento',
      certificateLabel: 'CERTIFICADO DE EXAMEN DEL EVENTO',
    }
  }
  return {
    certificateTitle: 'Certificado de Asistencia al Evento en Vivo',
    certificateLabel: 'CERTIFICADO DE ASISTENCIA AL EVENTO EN VIVO',
  }
}

function formatCertificate(attendee: MockAttendee, email: string, cert: MockCertificate) {
  return {
    certificateCode: cert.certificateCode,
    certificateType: cert.certificateType,
    certificateTitle: cert.certificateTitle,
    certificateLabel: cert.certificateLabel,
    issuedAt: cert.issuedAt,
    recipient: {
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      fullName: `${attendee.firstName} ${attendee.lastName}`.trim(),
      email,
    },
    event: EVENT,
  }
}

function randomCode() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function issueMockCertificate(
  email: string,
  attendee: MockAttendee,
  certificateType: 'LIVE_VIEWING' | 'EXAM',
) {
  const normalized = email.trim().toLowerCase()
  const state = getUserState(normalized)
  const key = certificateType === 'LIVE_VIEWING' ? 'viewing' : 'exam'
  const existing = state[key]
  if (existing) return formatCertificate(attendee, normalized, existing)
  const meta = certMeta(certificateType)
  const issued: MockCertificate = {
    certificateCode: randomCode(),
    certificateType,
    certificateTitle: meta.certificateTitle,
    certificateLabel: meta.certificateLabel,
    issuedAt: new Date().toISOString(),
    recipient: {
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      fullName: `${attendee.firstName} ${attendee.lastName}`.trim(),
      email: normalized,
    },
    event: EVENT,
  }
  state[key] = issued
  return formatCertificate(attendee, normalized, issued)
}

export function mockAttendanceStatus(email: string) {
  const normalized = email.trim().toLowerCase()
  const attendee = getAttendee(normalized)
  if (!attendee) {
    return {
      status: 'NOT_FOUND',
      message: 'No encontramos tu correo en la lista de asistentes del evento.',
      watchedOver80: false,
      canClaimViewing: false,
      canTakeExam: false,
      canOnlyTakeExam: false,
      viewingCertificate: null,
      examCertificate: null,
    }
  }
  const state = getUserState(normalized)
  const viewingCertificate = state.viewing
    ? formatCertificate(attendee, normalized, state.viewing)
    : null
  const examCertificate = state.exam
    ? formatCertificate(attendee, normalized, state.exam)
    : null
  return {
    status: 'OK',
    watchedOver80: attendee.watchedOver80,
    canClaimViewing: attendee.watchedOver80 && !state.viewing,
    canTakeExam: !state.exam && !state.examPassed,
    canOnlyTakeExam: !attendee.watchedOver80,
    recipient: {
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      fullName: `${attendee.firstName} ${attendee.lastName}`.trim(),
      email: normalized,
    },
    viewingCertificate,
    examCertificate,
  }
}

export function mockClaimViewing(email: string) {
  const normalized = email.trim().toLowerCase()
  const attendee = getAttendee(normalized)
  if (!attendee) {
    return {
      status: 'NOT_FOUND',
      message: 'No encontramos tu correo en la lista de asistentes del evento.',
      certificateType: 'LIVE_VIEWING',
      certificate: null,
    }
  }
  const state = getUserState(normalized)
  if (state.viewing) {
    return {
      status: 'ALREADY_ISSUED',
      message: 'Ya obtuviste tu certificado por asistencia al evento en vivo.',
      certificateType: 'LIVE_VIEWING',
      certificate: formatCertificate(attendee, normalized, state.viewing),
    }
  }
  if (!attendee.watchedOver80) {
    return {
      status: 'NOT_ELIGIBLE',
      message: 'No alcanzaste el 80% de visualización del evento en vivo.',
      certificateType: 'LIVE_VIEWING',
      certificate: null,
    }
  }
  return {
    status: 'CERTIFICATE_ISSUED',
    message: 'Obtuviste tu certificado por asistencia al evento en vivo (+80%).',
    certificateType: 'LIVE_VIEWING',
    certificate: issueMockCertificate(normalized, attendee, 'LIVE_VIEWING'),
  }
}

export function mockClaimExam(email: string) {
  const normalized = email.trim().toLowerCase()
  const attendee = getAttendee(normalized)
  if (!attendee) {
    return {
      status: 'NOT_FOUND',
      message: 'No encontramos tu correo en la lista de asistentes del evento.',
      certificateType: 'EXAM',
      certificate: null,
    }
  }
  const state = getUserState(normalized)
  if (state.exam) {
    return {
      status: 'ALREADY_ISSUED',
      message: 'Ya obtuviste tu certificado por examen de asistencia.',
      certificateType: 'EXAM',
      certificate: formatCertificate(attendee, normalized, state.exam),
    }
  }
  if (!state.examPassed) {
    return {
      status: 'NOT_ELIGIBLE',
      message: 'Aún no has aprobado el examen de asistencia.',
      certificateType: 'EXAM',
      certificate: null,
    }
  }
  return {
    status: 'CERTIFICATE_ISSUED',
    message: 'Obtuviste tu certificado por examen de asistencia.',
    certificateType: 'EXAM',
    certificate: issueMockCertificate(normalized, attendee, 'EXAM'),
  }
}

export function mockGetAttendanceExam(email: string) {
  const normalized = email.trim().toLowerCase()
  const attendee = getAttendee(normalized)
  if (!attendee) {
    throw new Error('No encontramos tu correo en la lista de asistentes del evento')
  }
  const state = getUserState(normalized)
  if (state.exam) {
    throw new Error('Ya obtuviste tu certificado por examen de asistencia')
  }
  return MOCK_EXAM
}

export function mockSubmitAttendanceExam(
  email: string,
  answers: { questionId: string; optionId: string }[],
) {
  const normalized = email.trim().toLowerCase()
  const attendee = getAttendee(normalized)
  if (!attendee) {
    throw new Error('No encontramos tu correo en la lista de asistentes del evento')
  }
  const state = getUserState(normalized)
  if (state.exam) {
    throw new Error('Ya obtuviste tu certificado por examen de asistencia')
  }

  const total = MOCK_EXAM.questions.length
  let correct = 0
  for (const q of MOCK_EXAM.questions) {
    const answer = answers.find(a => a.questionId === q.id)
    if (answer && answer.optionId === MOCK_CORRECT[q.id]) correct++
  }

  const nota = calcAttendanceExamGrade(correct, total)
  const passed = passesAttendanceExamGrade(nota)

  if (!passed) {
    return {
      status: 'FAILED',
      message: 'No alcanzaste la nota mínima de 5,0. Puedes intentar nuevamente.',
      correctas: correct,
      total,
      nota,
      notaMaxima: ATTENDANCE_EXAM_MAX_GRADE,
      notaAprobacion: ATTENDANCE_EXAM_PASS_GRADE,
      passed: false,
      canTakeExam: true,
      certificate: null,
    }
  }

  state.examPassed = true
  const certificate = issueMockCertificate(normalized, attendee, 'EXAM')
  return {
    status: 'CERTIFICATE_ISSUED',
    message: 'Aprobaste el examen. Tu certificado ha sido emitido.',
    correctas: correct,
    total,
    nota,
    notaMaxima: ATTENDANCE_EXAM_MAX_GRADE,
    notaAprobacion: ATTENDANCE_EXAM_PASS_GRADE,
    passed: true,
    canTakeExam: false,
    certificate,
  }
}

export function mockVerifyAttendance(code: string) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return { valid: false }

  const store = getStore()
  for (const state of store.values()) {
    for (const cert of [state.viewing, state.exam]) {
      if (cert && cert.certificateCode === normalized) {
        return {
          valid: true,
          certificateType: cert.certificateType,
          certificateTitle: cert.certificateTitle,
          certificateLabel: cert.certificateLabel,
          certificateCode: cert.certificateCode,
          issuedAt: cert.issuedAt,
          recipient: cert.recipient,
          event: cert.event,
        }
      }
    }
  }

  return { valid: false }
}
