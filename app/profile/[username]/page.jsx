import { notFound } from 'next/navigation'
import CardFailPost from '@/components/cards/CardFailPost'
import { SEED_PROFILES, SEED_POSTS, getAvatarUrl, formatNumber, getTotalReactions, getFailureScore } from '@/lib/seed-data'
import { theme } from '@/lib/theme'

export function generateStaticParams() {
  return SEED_PROFILES.map(p => ({ username: p.username }))
}

export function generateMetadata({ params }) {
  const profile = SEED_PROFILES.find(p => p.username === params.username)
  if (!profile) return { title: 'Not Found' }
  return { title: `${profile.display_name} — Failbase` }
}

const BADGES = [
  { emoji: '💀', label: 'Legendary Loser', condition: (score) => score > 20000 },
  { emoji: '📉', label: 'Serial Failer', condition: (_, count) => count >= 2 },
  { emoji: '🏆', label: 'Top 10 Shame', condition: (score) => score > 10000 },
  { emoji: '🤡', label: 'Thought Leader', condition: () => true },
]

export default function ProfilePage({ params }) {
  const profile = SEED_PROFILES.find(p => p.username === params.username)
  if (!profile) notFound()

  const userPosts = SEED_POSTS.filter(p => p.author_id === profile.id)
  const totalScore = userPosts.reduce((s, p) => s + getFailureScore(p), 0)
  const totalReactions = userPosts.reduce((s, p) => s + getTotalReactions(p.reactions), 0)
  const earnedBadges = BADGES.filter(b => b.condition(totalScore, userPosts.length))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="card mb-5 overflow-hidden">
        {/* Cover — pure CSS gradient, no image needed */}
        <div className="h-28 sm:h-36"
          style={{ background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent} 100%)` }} />

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={getAvatarUrl(profile.avatar_seed)}
                alt={profile.display_name}
                width={96} height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 mb-1">
              <button
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                style={{ border: `2px solid ${theme.dark}`, color: theme.dark }}>
                + Connect
              </button>
              <button
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{ border: `1px solid ${theme.border}`, color: theme.muted }}>
                Message
              </button>
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: theme.dark }}>
            {profile.display_name}
          </h1>
          <p style={{ fontSize: '13px', color: theme.muted, marginTop: '2px' }}>{profile.title}</p>

          <div className="flex flex-wrap items-center gap-x-4 mt-2" style={{ fontSize: '13px', color: theme.muted }}>
            <span>📍 Remote (By Necessity)</span>
            <span style={{ color: theme.accent, fontWeight: 600 }}>{formatNumber(profile.connections)} connections</span>
          </div>

          {earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {earnedBadges.map(badge => (
                <span key={badge.label}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: theme.accentLight, color: theme.accent, border: `1px solid ${theme.accent}44` }}>
                  {badge.emoji} {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5">
        {/* Stats sidebar */}
        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Stats
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Shame Score', value: formatNumber(totalScore), color: theme.red },
                { label: 'Posts', value: userPosts.length },
                { label: 'Reactions', value: formatNumber(totalReactions) },
                { label: 'Connections', value: formatNumber(profile.connections) },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-xs">
                  <span style={{ color: theme.muted }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.color || theme.dark, fontFamily: 'var(--font-mono)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              About
            </h3>
            <p style={{ fontSize: '12px', color: theme.muted, lineHeight: 1.6, fontStyle: 'italic' }}>
              "{profile.display_name} has learned from failure by failing repeatedly and with great enthusiasm."
            </p>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 style={{ fontSize: '11px', fontWeight: 700, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', paddingLeft: '4px' }}>
            Activity · {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
          </h2>
          {userPosts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {userPosts.map(post => <CardFailPost key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="card p-8 text-center" style={{ color: theme.muted }}>
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-sm">No posts yet.</p>
              <p style={{ fontSize: '12px', color: theme.muted, opacity: 0.6, marginTop: '4px', fontStyle: 'italic' }}>
                Suspiciously clean record.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
