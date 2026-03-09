import Link from 'next/link'
import { getProfile, getAvatarUrl, formatNumber, REACTIONS, getTotalReactions, getFailureScore } from '@/lib/seed-data'

const RANK_MEDALS = ['🥇', '🥈', '🥉']
const RANK_LABELS = ['Grand Champion of Failure', 'Distinguished Loser', 'Certified Disaster']

export default function CardLeaderboardEntry({ post, rank }) {
  const profile = getProfile(post.author_id)
  const score = getFailureScore(post)
  const topReactionKey = Object.entries(post.reactions).sort(([,a],[,b]) => b-a)[0][0]
  const topReaction = REACTIONS.find(r => r.key === topReactionKey)

  return (
    <div className={`card p-4 flex gap-4 items-center
      ${rank === 1 ? 'border-2 border-fail-gold ring-1 ring-fail-gold/30' : ''}
      ${rank === 2 ? 'border-2 border-gray-300' : ''}
      ${rank === 3 ? 'border-2 border-amber-600/50' : ''}
    `}>
      {/* Rank */}
      <div className="shrink-0 text-center w-10">
        {rank <= 3 ? (
          <div className="text-2xl">{RANK_MEDALS[rank - 1]}</div>
        ) : (
          <div className="text-xl font-bold text-fb-muted font-mono">#{rank}</div>
        )}
      </div>

      {/* Avatar */}
      <Link href={`/profile/${profile?.username}`} className="shrink-0">
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <img
            src={getAvatarUrl(profile?.avatar_seed)}
            alt={profile?.display_name}
            width={44}
            height={44}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link href={`/profile/${profile?.username}`} className="font-semibold text-fb-charcoal hover:underline text-sm">
            {profile?.display_name}
          </Link>
          {rank <= 3 && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-fail-shame">
              {RANK_LABELS[rank - 1]}
            </span>
          )}
        </div>
        <p className="text-xs text-fb-muted truncate mt-0.5">{post.content.slice(0, 80)}...</p>
      </div>

      {/* Score */}
      <div className="shrink-0 text-right">
        <div className="text-lg font-bold font-mono text-fail-shame">{formatNumber(score)}</div>
        <div className="text-[10px] text-fb-muted uppercase tracking-wide">shame pts</div>
        <div className="text-sm mt-0.5">{topReaction?.emoji} {formatNumber(post.reactions[topReactionKey])}</div>
      </div>
    </div>
  )
}
