'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('tauren-theme') as Theme | null
    const activeTheme: Theme = saved ?? 'dark'
    setTheme(activeTheme)
    document.documentElement.classList.toggle('dark', activeTheme === 'dark')
    if (!saved) localStorage.setItem('tauren-theme', activeTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('tauren-theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  if (!mounted) {
    return <div className="h-10 w-10 rounded-xl border border-border bg-card/60" />
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 text-foreground transition hover:bg-card"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
