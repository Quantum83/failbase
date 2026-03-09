'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { theme } from '@/lib/theme'

const navItems = [
  { href: '/', label: 'Feed', icon: '📉' },
  { href: '/leaderboard', label: 'Shame Board', icon: '🏆' },
]

export default function LayoutNav() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: theme.border }}>
      <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})` }}>
            f
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: theme.dark, letterSpacing: '-0.02em' }}>
            Failbase
          </span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: theme.accent, background: theme.accentLight, border: `1px solid ${theme.accent}`, padding: '1px 7px', borderRadius: '99px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            beta
          </span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xs">
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Search failures..."
              className="w-full rounded-full px-4 py-1.5 text-sm focus:outline-none transition-colors"
              style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.muted }}
              readOnly
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base">🔍</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
                style={{ color: isActive ? theme.accent : theme.muted }}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
              </Link>
            )
          })}

          <div className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg cursor-pointer"
            style={{ color: theme.muted }}>
            <span className="text-lg leading-none">🔔</span>
            <span style={{ fontSize: '11px' }}>Regrets</span>
            <span className="absolute top-0.5 right-1.5 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
              style={{ background: theme.red }}>99</span>
          </div>

          <Link href="/submit"
            className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})` }}>
            ✍️ Post Failure
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" style={{ color: theme.muted }}
          onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Menu">
          <div className="w-5 h-0.5 bg-current mb-1.5 rounded" />
          <div className="w-5 h-0.5 bg-current mb-1.5 rounded" />
          <div className="w-5 h-0.5 bg-current rounded" />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-1"
          style={{ borderColor: theme.border }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2 py-2 px-2 text-sm font-medium rounded-lg"
              style={{ color: theme.dark }}
              onClick={() => setIsMobileOpen(false)}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <Link href="/submit"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-full text-sm font-semibold text-white mt-1"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})` }}
            onClick={() => setIsMobileOpen(false)}>
            ✍️ Post Your Failure
          </Link>
        </div>
      )}
    </header>
  )
}
