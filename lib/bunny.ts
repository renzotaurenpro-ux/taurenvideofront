export function normalizeBunnyUrl(url?: string): string | undefined {
  if (!url) return url
  const m = url.match(/mediadelivery\.net\/(?:play|download)\/(\d+)\/([a-f0-9-]+)/i)
  if (m) return `https://iframe.mediadelivery.net/embed/${m[1]}/${m[2]}`
  return url
}
