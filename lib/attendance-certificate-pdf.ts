import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'
import {
  ATTENDANCE_VERIFY_PATH,
  type AttendanceCertificateData,
} from './attendance'
import {
  CERT_BG,
  getCertificateOverlayContent,
} from './attendance-certificate-layout'

const TEMPLATE_URL = '/certificados/plantilla-asistencia.pdf'
const PAGE_W = 810
const PAGE_H = 630
const NAME_Y_FROM_TOP = 293
const NAME_SIZE = 30
const QR_SIZE = 54
const QR_MARGIN_RIGHT = 38
const QR_MARGIN_BOTTOM = 34

const BG = rgb(0.933, 0.945, 0.961)

type BuildParams = {
  fullName: string
  certificateCode: string
  heading: string
  bodyText: string | null
  replaceBody: boolean
  verifyUrl: string
}

export function buildAttendanceVerifyUrl(certificateCode: string, origin: string) {
  return `${origin}${ATTENDANCE_VERIFY_PATH}/${certificateCode}`
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

function wrapText(
  text: string,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  size: number,
  maxWidth: number,
) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next
    } else {
      if (line) lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function buildAttendanceCertificatePdf(params: BuildParams): Promise<Uint8Array> {
  const templateBytes = await fetch(TEMPLATE_URL).then(r => {
    if (!r.ok) throw new Error('No se pudo cargar la plantilla del certificado')
    return r.arrayBuffer()
  })

  const pdfDoc = await PDFDocument.load(templateBytes)
  const page = pdfDoc.getPages()[0]
  const { width, height } = page.getSize()
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)
  const mono = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const padX = width * 0.05
  const contentW = width * 0.9

  page.drawRectangle({
    x: padX,
    y: height * 0.525,
    width: contentW,
    height: height * 0.135,
    color: BG,
  })

  const otorgaSize = 11
  const otorga = 'Otorga el presente'
  const otorgaW = fontItalic.widthOfTextAtSize(otorga, otorgaSize)
  page.drawText(otorga, {
    x: (width - otorgaW) / 2,
    y: height * 0.715,
    size: otorgaSize,
    font: fontItalic,
    color: rgb(0.29, 0.34, 0.4),
  })

  const headingSize = fitFontSize(params.heading, fontBold, 19, contentW - 20)
  const headingW = fontBold.widthOfTextAtSize(params.heading, headingSize)
  page.drawText(params.heading, {
    x: (width - headingW) / 2,
    y: height * 0.665,
    size: headingSize,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  })

  const name = params.fullName.trim()
  const nameSize = fitFontSize(name, fontBold, NAME_SIZE, contentW - 20)
  const nameW = fontBold.widthOfTextAtSize(name, nameSize)
  page.drawText(name, {
    x: (width - nameW) / 2,
    y: height - NAME_Y_FROM_TOP - nameSize * 0.35,
    size: nameSize,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  })

  if (params.replaceBody && params.bodyText) {
    page.drawRectangle({
      x: width * 0.07,
      y: height * 0.335,
      width: width * 0.86,
      height: height * 0.16,
      color: BG,
    })
    const bodySize = 10.5
    const bodyLines = wrapText(params.bodyText, font, bodySize, width * 0.78)
    let bodyY = height * 0.475
    for (const line of bodyLines) {
      const lineW = font.widthOfTextAtSize(line, bodySize)
      page.drawText(line, {
        x: (width - lineW) / 2,
        y: bodyY,
        size: bodySize,
        font,
        color: rgb(0.12, 0.16, 0.22),
      })
      bodyY -= bodySize * 1.45
    }
  }

  const qrDataUrl = await QRCode.toDataURL(params.verifyUrl, {
    margin: 0,
    width: 180,
    color: { dark: '#1e3a5f', light: CERT_BG },
  })
  const qrBase64 = qrDataUrl.split(',')[1] ?? ''
  const qrBytes = Uint8Array.from(atob(qrBase64), c => c.charCodeAt(0))
  const qrImage = await pdfDoc.embedPng(qrBytes)

  const qrX = width - QR_SIZE - QR_MARGIN_RIGHT
  const qrY = QR_MARGIN_BOTTOM
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: QR_SIZE,
    height: QR_SIZE,
  })

  const code = params.certificateCode
  const codeSize = 5.5
  const codeWidth = mono.widthOfTextAtSize(code, codeSize)
  page.drawText(code, {
    x: qrX + (QR_SIZE - codeWidth) / 2,
    y: qrY - 9,
    size: codeSize,
    font: mono,
    color: rgb(0.45, 0.5, 0.58),
  })

  return pdfDoc.save()
}

export async function downloadAttendanceCertificatePdf(
  certificate: AttendanceCertificateData,
  origin: string,
) {
  const { heading, bodyText, replaceBody } = getCertificateOverlayContent(certificate)
  const verifyUrl = buildAttendanceVerifyUrl(certificate.certificateCode, origin)
  const bytes = await buildAttendanceCertificatePdf({
    fullName: certificate.recipient.fullName,
    certificateCode: certificate.certificateCode,
    heading,
    bodyText,
    replaceBody,
    verifyUrl,
  })
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const safeName = certificate.recipient.fullName.replace(/[\\/:*?"<>|]+/g, '').trim() || 'asistencia'
  const slug = certificate.certificateType === 'EXAM' ? 'examen' : 'asistencia-vivo'
  const a = document.createElement('a')
  a.href = url
  a.download = `certificado-${slug}-${safeName}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export { ATTENDANCE_CERT_ASPECT } from './attendance-certificate-layout'
