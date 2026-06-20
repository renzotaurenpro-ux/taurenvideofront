export default function SiteDeveloperCredit() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/15 px-4 py-2.5 text-center backdrop-blur-md"
      style={{
        background: 'rgba(8,18,32,0.88)',
        paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))',
      }}
    >
      <p className="text-xs sm:text-sm text-white/85">
        Sitio desarrollado por{' '}
        <a
          href="https://taurenproeventos.cl/"
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold text-[var(--scai-teal)] transition-colors hover:text-white hover:underline underline-offset-2"
        >
          Tauren Pro Eventos
        </a>
      </p>
    </div>
  )
}
