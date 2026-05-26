export function bunnyEmbedNoAutoplay(url: string): string {
  if (!url.includes('mediadelivery.net')) return url
  try {
    const u = new URL(url)
    u.searchParams.set('autoplay', 'false')
    return u.toString()
  } catch {
    const base = url.replace(/([?&])autoplay=(true|1)/gi, '$1autoplay=false')
    if (/[?&]autoplay=/i.test(base)) return base
    return `${base}${base.includes('?') ? '&' : '?'}autoplay=false`
  }
}

export function normalizeBunnyUrl(url?: string): string | undefined {
  if (!url) return url
  const m = url.match(/mediadelivery\.net\/(?:play|download|embed)\/(\d+)\/([a-f0-9-]+)/i)
  if (m) return bunnyEmbedNoAutoplay(`https://iframe.mediadelivery.net/embed/${m[1]}/${m[2]}`)
  if (url.includes('mediadelivery.net')) return bunnyEmbedNoAutoplay(url)
  return url
}
