import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import {
  ATTENDANCE_VERIFY_PATH,
  type AttendanceCertificateData,
} from './attendance'
import {
  CERT_LAYOUT,
  getCertificateTemplatePdf,
} from './attendance-certificate-layout'
import { normalizeSpanishText } from './text-encoding'

type BuildParams = {
  fullName: string
  templateUrl: string
}

const CERT_FONT_URL = '/fonts/NotoSans-Bold.ttf'

let certFontBytesPromise: Promise<ArrayBuffer> | null = null

export function buildAttendanceVerifyUrl(certificateCode: string, origin: string) {
  return `${origin}${ATTENDANCE_VERIFY_PATH}/${certificateCode}`
}

function loadCertFontBytes() {
  if (!certFontBytesPromise) {
    certFontBytesPromise = fetch(CERT_FONT_URL).then(res => {
      if (!res.ok) throw new Error('No se pudo cargar la fuente del certificado')
      return res.arrayBuffer()
    })
  }
  return certFontBytesPromise
}

function fitFontSize(
  text: string,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  maxSize: number,
  maxWidth: number,
) {
  let size = maxSize
  while (size > 7 && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5
  }
  return size
}

export async function buildAttendanceCertificatePdf(params: BuildParams): Promise<Uint8Array> {
  const templateBytes = await fetch(params.templateUrl).then(r => {
    if (!r.ok) throw new Error('No se pudo cargar la plantilla del certificado')
    return r.arrayBuffer()
  })

  const pdfDoc = await PDFDocument.load(templateBytes)
  pdfDoc.registerFontkit(fontkit)
  const fontBytes = await loadCertFontBytes()
  const fontBold = await pdfDoc.embedFont(fontBytes)

  const page = pdfDoc.getPages()[0]
  const { width } = page.getSize()

  const name = normalizeSpanishText(params.fullName)
  const nameSize = fitFontSize(name, fontBold, CERT_LAYOUT.nameMaxSize, CERT_LAYOUT.nameMaxWidth)
  const nameWidth = fontBold.widthOfTextAtSize(name, nameSize)

  page.drawText(name, {
    x: (width - nameWidth) / 2,
    y: CERT_LAYOUT.nameBaselineY,
    size: nameSize,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  })

  return pdfDoc.save()
}

export async function buildAttendanceCertificatePdfBytes(
  certificate: AttendanceCertificateData,
): Promise<Uint8Array> {
  return buildAttendanceCertificatePdf({
    fullName: certificate.recipient.fullName,
    templateUrl: getCertificateTemplatePdf(certificate),
  })
}

export async function createAttendanceCertificatePreviewUrl(
  certificate: AttendanceCertificateData,
  _origin: string,
): Promise<string> {
  const bytes = await buildAttendanceCertificatePdfBytes(certificate)
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

export async function downloadAttendanceCertificatePdf(
  certificate: AttendanceCertificateData,
  _origin: string,
) {
  const bytes = await buildAttendanceCertificatePdfBytes(certificate)
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const safeName = normalizeSpanishText(certificate.recipient.fullName).replace(/[\\/:*?"<>|]+/g, '').trim() || 'asistencia'
  const slug = certificate.certificateType === 'EXAM' ? 'examen' : 'asistencia-vivo'
  const a = document.createElement('a')
  a.href = url
  a.download = `certificado-${slug}-${safeName}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export { ATTENDANCE_CERT_ASPECT } from './attendance-certificate-layout'
