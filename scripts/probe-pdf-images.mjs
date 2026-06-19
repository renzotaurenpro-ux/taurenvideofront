import { readFileSync } from 'fs'
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs'

const data = new Uint8Array(readFileSync('public/certificados/plantilla-asistencia-vivo.pdf'))
const pdf = await getDocument({ data }).promise
const page = await pdf.getPage(1)
const ops = await page.getOperatorList()
const objs = page.objs
let imgCount = 0
for (let i = 0; i < ops.fnArray.length; i++) {
  if (ops.fnArray[i] === OPS.paintImageXObject || ops.fnArray[i] === OPS.paintInlineImageXObject) {
    imgCount++
    console.log('image op', imgCount, ops.argsArray[i])
  }
}
console.log('total images', imgCount)
