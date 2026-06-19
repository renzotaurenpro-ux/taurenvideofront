export function normalizeSpanishText(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || !/[ÃÐÑ�]/.test(trimmed)) return trimmed
  try {
    const bytes = new Uint8Array(trimmed.length)
    for (let i = 0; i < trimmed.length; i++) bytes[i] = trimmed.charCodeAt(i) & 0xff
    const repaired = new TextDecoder('utf-8').decode(bytes)
    if (repaired && repaired !== trimmed) return repaired.trim()
  } catch {}
  return trimmed
}
