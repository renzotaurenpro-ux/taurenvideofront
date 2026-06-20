import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import toIco from 'to-ico'

const root = process.cwd()
const publicDir = path.join(root, 'public')
const logoPath = path.join(root, 'Logotipo-SCAI.png')
const bg = '#0B1928'

const logo = sharp(logoPath)
const meta = await logo.metadata()
const h = meta.height ?? 512
const cropSize = Math.round(h * 0.92)

const iconSquare = await sharp(logoPath)
  .extract({ left: 0, top: Math.round((h - cropSize) / 2), width: cropSize, height: cropSize })
  .resize(512, 512, { fit: 'contain', background: bg })
  .png()
  .toBuffer()

const sizes = [16, 32, 48]
const pngBuffers = await Promise.all(
  sizes.map(size =>
    sharp(iconSquare).resize(size, size, { fit: 'cover' }).png().toBuffer()
  )
)

const ico = await toIco(pngBuffers)
const appleIcon = await sharp(logoPath)
  .resize(132, null, { fit: 'inside' })
  .extend({
    top: 24,
    bottom: 24,
    left: 24,
    right: 24,
    background: bg,
  })
  .resize(180, 180, { fit: 'contain', background: bg })
  .png()
  .toBuffer()

await writeFile(path.join(publicDir, 'favicon.ico'), ico)
await writeFile(path.join(publicDir, 'icon.png'), pngBuffers[1])
await writeFile(path.join(publicDir, 'icon-16.png'), pngBuffers[0])
await writeFile(path.join(publicDir, 'apple-icon.png'), appleIcon)
await writeFile(path.join(publicDir, 'icon-192.png'), await sharp(iconSquare).resize(192, 192).png().toBuffer())
await writeFile(path.join(publicDir, 'icon-512.png'), await sharp(iconSquare).resize(512, 512).png().toBuffer())

console.log('favicon generado')
