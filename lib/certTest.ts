export const CERT_PASSED_KEY = '__tauren_cert_passed_v1'
export const CERT_MIN_SCORE = 21

export type CertQ = { q: string; o: [string, string, string, string]; c: 0 | 1 | 2 | 3 }

const BASE: CertQ[] = [
  { q: '¿Qué significa EII en el contexto de estas jornadas?', o: ['Errores Innatos de la Inmunidad', 'Enfermedad infecciosa intestinal', 'Estrés inmune inducido', 'Examen inmunológico integral'], c: 0 },
  { q: '¿Cuántos módulos temáticos incluye el evento?', o: ['2', '3', '4', '6'], c: 2 },
  { q: '¿Qué acreditación se menciona para educación médica continua?', o: ['MINSAL', 'CONACEM', 'OMS', 'COLMED'], c: 1 },
  { q: '¿En qué modalidad está disponible la grabación?', o: ['Solo presencial', 'Online', 'Solo audio', 'Solo texto'], c: 1 },
  { q: '¿Cuál es el objetivo principal del contenido?', o: ['Entretenimiento', 'Actualización médica', 'Publicidad', 'Ventas'], c: 1 },
  { q: '¿Qué herramientas se mencionan para el diagnóstico avanzado?', o: ['Citometría de flujo y genética', 'Radiografías simples', 'ECG', 'Endoscopía digestiva'], c: 0 },
  { q: '¿Cómo se describe el acceso al contenido de pago?', o: ['Suscripción mensual', 'Pago único', 'Gratis', 'Por cupón diario'], c: 1 },
  { q: '¿Qué organismo organiza las jornadas?', o: ['SCAI', 'OPS', 'UNICEF', 'FIFA'], c: 0 },
  { q: '¿Cuántos expositores se mencionan en el material del evento?', o: ['8', '12', '16', '24'], c: 2 },
  { q: '¿Qué tipo de inmunodeficiencias aborda principalmente el programa?', o: ['Primarias', 'Solo secundarias', 'Solo autoinmunes', 'Solo alérgicas'], c: 0 },
]

function expand(): CertQ[] {
  const suf = ['', ' — revisión', ' — aplicación clínica']
  const out: CertQ[] = []
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 10; i++) {
      const b = BASE[i]
      out.push({ ...b, q: `${out.length + 1}. ${b.q}${suf[r]}` })
    }
  }
  return out
}

export const CERT_QUESTIONS: CertQ[] = expand()
