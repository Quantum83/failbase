import Link from 'next/link'
import FeedSorter from '@/components/ui/FeedSorter'
import CardProfile from '@/components/cards/CardProfile'
import CardStatsWidget from '@/components/cards/CardStatsWidget'
import CardTrendingTopics from '@/components/cards/CardTrendingTopics'
import { SEED_POSTS } from '@/lib/seed-data'
import { theme } from '@/lib/theme'

export const metadata = {
  title: 'Failbase — Where Professionals Come to Be Honest',
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Hero banner */}
      <div className="card mb-6 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent} 100%)` }}>
        <div className="p-6 sm:p-8 relative">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: theme.highlight, transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: '#fff', transform: 'translateY(50%)' }} />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📉</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  The honest professional network
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '8px' }}>
                Where failure gets the<br />
                <em style={{ color: theme.highlight }}>standing ovation</em> it deserves.
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', maxWidth: '380px' }}>
                Real growth comes from real stories. Post yours — the messier the better.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link href="/submit"
                className="px-5 py-2.5 rounded-full font-semibold text-sm text-center transition-all hover:opacity-90"
                style={{ background: theme.highlight, color: 'white' }}>
                ✍️ Share Your Story
              </Link>
              <Link href="/leaderboard"
                className="px-5 py-2.5 rounded-full font-semibold text-sm text-center"
                style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                🏆 Hall of Honesty
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_240px] gap-5">

        {/* Left sidebar */}
        <aside className="hidden lg:flex flex-col gap-4">
          <CardProfile />
          <CardStatsWidget />
          <div className="card p-4">
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              People Who Get It
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Greg Hoffman', title: 'NFT Artist (Retired)', seed: 'Greg' },
                { name: 'Stacey Bloom', title: 'Life Coach (Self-Certified)', seed: 'Stacey' },
                { name: 'Marcus T.', title: 'Founder of 0 Products', seed: 'Marcus' },
              ].map((person) => (
                <div key={person.name} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/8.x/notionists/svg?seed=${person.seed}&backgroundColor=b6e3f4,c0aede`} alt={person.name} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.dark }} className="truncate">{person.name}</div>
                    <div style={{ fontSize: '11px', color: theme.muted }} className="truncate">{person.title}</div>
                  </div>
                  <button style={{ fontSize: '11px', color: theme.accent, border: `1px solid ${theme.accent}`, borderRadius: '99px', padding: '2px 10px', fontWeight: 600 }}>
                    + Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main feed — FeedSorter is a client component that handles sorting */}
        <section className="flex flex-col gap-4 min-w-0">
          <FeedSorter posts={SEED_POSTS} />
          <div className="card p-4 text-center">
            <button style={{ fontSize: '14px', fontWeight: 600, color: theme.accent }} className="hover:underline">
              Load more stories ↓
            </button>
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="hidden lg:flex flex-col gap-4">
          <CardTrendingTopics />
          <div className="card p-4" style={{ borderStyle: 'dashed' }}>
            <div style={{ fontSize: '10px', color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Promoted</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: theme.dark, marginBottom: '4px' }}>🧘 Failure Coaching</div>
            <p style={{ fontSize: '12px', color: theme.muted, marginBottom: '10px', lineHeight: 1.5 }}>
              Turn your collapse into a comeback arc. 12 weeks. <em>"I too was once employed."</em>
            </p>
            <button style={{ width: '100%', fontSize: '12px', fontWeight: 600, padding: '6px', borderRadius: '99px', border: `1px solid ${theme.border}`, color: theme.muted }}>
              Learn More (Maybe Don't)
            </button>
          </div>
          <div className="card p-4 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${theme.dark}, ${theme.accent})` }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              🌟 Story of the Week
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>Kevin "Web5" Larsson</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginBottom: '10px', lineHeight: 1.5 }}>
              Lost $400K in NFTs. Still in the Discord. Launched a Substack. We're proud.
            </div>
            <Link href="/leaderboard" style={{ fontSize: '12px', fontWeight: 600, color: theme.highlight }} className="hover:underline">
              See full board →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
