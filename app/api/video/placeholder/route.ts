import { readFile } from 'fs/promises'
import path from 'path'

const REMOTES = [
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
]

export async function GET() {
  try {
    const local = path.join(process.cwd(), 'public', 'videos', 'demo.mp4')
    const buf = await readFile(local)
    return new Response(buf, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(buf.length),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch {
    for (const url of REMOTES) {
      try {
        const res = await fetch(url)
        if (!res.ok) continue
        const buf = Buffer.from(await res.arrayBuffer())
        return new Response(buf, {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': String(buf.length),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400',
          },
        })
      } catch {
        continue
      }
    }
    return new Response(null, { status: 502 })
  }
}
