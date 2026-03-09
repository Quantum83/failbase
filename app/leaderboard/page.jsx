import CardLeaderboardEntry from '@/components/cards/CardLeaderboardEntry'
import CardTrendingTopics from '@/components/cards/CardTrendingTopics'
import { getRankedPosts, formatNumber, REACTIONS, getTotalReactions } from '@/lib/seed-data'

export const metadata = {
  title: 'Shame Board — Failbase',
  description: 'The definitive ranking of professional failures. Updated in real-time as careers collapse.',
}

function StatCard({ emoji, label, value, sub }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-3xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold font-mono text-fb-charcoal">{value}</div>
      <div className="text-xs font-semibold text-fb-muted uppercase tracking-wide">{label}</div>
      {sub && <div className="text-[11px] text-fb-muted/70 mt-1">{sub}</div>}
    </div>
  )
}

export default function LeaderboardPage() {
  const rankedPosts = getRankedPosts()
  const topPost = rankedPosts[0]
  const totalReactionsAll = rankedPosts.reduce((s, p) => s + getTotalReactions(p.reactions), 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="card mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-fail-shame via-fb-charcoal to-fb-blue-dark p-6 text-white relative">
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 60px)' }} />
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">The Official</div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
              🏆 Failbase Shame Board
            </h1>
            <p className="text-white/70 text-sm max-w-lg">
              A living monument to professional humiliation. Ranked by shame score — a proprietary metric combining reactions, comments, and sheer audacity.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-fb-border">
          {[
            { emoji: '📉', label: 'Failures Posted', value: rankedPosts.length.toString(), sub: 'and counting' },
            { emoji: '😬', label: 'Total Reactions', value: formatNumber(totalReactionsAll), sub: 'expressions of sympathy' },
            { emoji: '💀', label: 'Active Disasters', value: '3', sub: 'trending right now' },
            { emoji: '🤝', label: 'Professionals Humbled', value: '7', sub: 'brave souls' },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 text-center">
              <div className="text-2xl mb-0.5">{s.emoji}</div>
              <div className="text-xl font-bold font-mono text-fb-charcoal">{s.value}</div>
              <div className="text-[11px] font-semibold text-fb-muted uppercase tracking-wide">{s.label}</div>
              <div className="text-[10px] text-fb-muted/60 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        {/* Leaderboard */}
        <div>
          {/* Reaction breakdown legend */}
          <div className="card p-3 mb-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-fb-muted uppercase tracking-wider">Shame Score =</span>
            {REACTIONS.map(r => (
              <span key={r.key} className="text-xs text-fb-muted flex items-center gap-1">
                {r.emoji} {r.label}
              </span>
            ))}
            <span className="text-xs text-fb-muted">+ 💬 Comments × 3</span>
          </div>

          {/* Ranked entries */}
          <div className="flex flex-col gap-3">
            {rankedPosts.map((post, i) => (
              <div key={post.id} className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}>
                <CardLeaderboardEntry post={post} rank={i + 1} />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="card mt-5 p-6 text-center bg-gradient-to-br from-fb-cream to-white">
            <div className="text-4xl mb-3">📉</div>
            <h3 className="font-display font-bold text-xl text-fb-charcoal mb-2">
              Think you can do worse?
            </h3>
            <p className="text-sm text-fb-muted mb-4">
              These legends didn't become Failbase icons by staying quiet about their disasters. <br />
              Your failure deserves an audience.
            </p>
            <a
              href="/submit"
              className="inline-block px-6 py-3 bg-fail-shame text-white rounded-full font-bold text-sm hover:bg-fb-charcoal transition-colors"
            >
              💀 Submit Your Failure to History
            </a>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:flex flex-col gap-4">
          <CardTrendingTopics />

          {/* Hall of shame quote */}
          <div className="card p-4">
            <div className="text-[10px] uppercase tracking-widest text-fb-muted mb-2">Quote of the Day</div>
            <blockquote className="text-sm italic text-fb-charcoal leading-relaxed border-l-4 border-fail-shame pl-3">
              "I didn't fail. I successfully identified 400 ways not to build a water-reminder app."
            </blockquote>
            <p className="text-xs text-fb-muted mt-2">— Patricia Dunmore-Wells, Failbase Legend</p>
          </div>

          {/* Shame tiers */}
          <div className="card p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-fb-muted mb-3">Shame Tiers</div>
            <div className="space-y-2">
              {[
                { tier: 'Grand Champion', range: '15,000+ pts', color: 'text-fail-gold font-bold', emoji: '🥇' },
                { tier: 'Distinguished Loser', range: '10,000–14,999', color: 'text-gray-500 font-semibold', emoji: '🥈' },
                { tier: 'Certified Disaster', range: '5,000–9,999', color: 'text-amber-700 font-semibold', emoji: '🥉' },
                { tier: 'Aspiring Failure', range: '1,000–4,999', color: 'text-fb-muted', emoji: '📉' },
                { tier: 'Just Getting Started', range: '0–999', color: 'text-fb-muted/60', emoji: '🌱' },
              ].map(t => (
                <div key={t.tier} className="flex justify-between items-center text-xs">
                  <span>{t.emoji} <span className={t.color}>{t.tier}</span></span>
                  <span className="text-fb-muted font-mono">{t.range}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
