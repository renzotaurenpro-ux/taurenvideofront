import { Mail, MessageCircle } from 'lucide-react'
import {
  SUPPORT_EMAIL,
  SUPPORT_MAILTO,
  SUPPORT_WHATSAPP,
  SUPPORT_WHATSAPP_URL,
} from '@/lib/site-config'

type Variant = 'inline' | 'card' | 'footer' | 'compact'

const styles: Record<Variant, {
  wrap: string
  label: string
  link: string
}> = {
  inline: {
    wrap: 'flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground',
    label: 'font-semibold text-foreground/80 dark:text-white/70',
    link: 'inline-flex items-center gap-1.5 hover:text-foreground transition-colors',
  },
  card: {
    wrap: 'space-y-2 text-xs',
    label: 'font-semibold uppercase tracking-wide text-muted-foreground dark:text-white/40',
    link: 'inline-flex items-center gap-1.5 text-sm text-foreground/80 dark:text-white/70 hover:text-[color:var(--scai-teal)] transition-colors',
  },
  footer: {
    wrap: 'flex flex-col sm:flex-row items-center gap-2 sm:gap-5 text-xs text-muted-foreground',
    label: 'font-semibold text-foreground/70',
    link: 'inline-flex items-center gap-1.5 hover:text-foreground transition-colors',
  },
  compact: {
    wrap: 'flex flex-col gap-1.5 text-xs',
    label: 'text-white/40 font-semibold uppercase tracking-wide',
    link: 'inline-flex items-center gap-1.5 text-white/65 hover:text-white transition-colors',
  },
}

export default function SupportContact({
  variant = 'inline',
  showLabel = true,
  className = '',
}: {
  variant?: Variant
  showLabel?: boolean
  className?: string
}) {
  const s = styles[variant]
  return (
    <div className={`${s.wrap} ${className}`}>
      {showLabel ? <span className={s.label}>Soporte</span> : null}
      <a href={SUPPORT_MAILTO} className={s.link}>
        <Mail size={13} style={{ color: 'var(--scai-teal)' }} />
        {SUPPORT_EMAIL}
      </a>
      <a
        href={SUPPORT_WHATSAPP_URL}
        target="_blank"
        rel="noreferrer noopener"
        className={s.link}
      >
        <MessageCircle size={13} style={{ color: 'var(--scai-teal)' }} />
        WhatsApp {SUPPORT_WHATSAPP}
      </a>
    </div>
  )
}
