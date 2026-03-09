'use client'
import Link from 'next/link'
import { useState, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { getProfile, getAvatarUrl, formatNumber, REACTIONS } from '@/lib/seed-data'
import { theme } from '@/lib/theme'

function ReactionPopup({ onReact, activeReaction }) {
  return (
    <>
      {/* Invisible bridge fills the gap between button and popup so mouse doesn't "leave" */}
      <div style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        width: '200px',
        height: '16px',
      }} />
      <div className="reaction-popup">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            className="reaction-popup-btn"
            style={{ background: activeReaction === r.key ? theme.accentLight : 'transparent' }}
            onClick={(e) => { e.stopPropagation(); onReact(r.key) }}
          >
            <span>{r.emoji}</span>
            <span className="tooltip">{r.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

export default function CardFailPost({ post }) {
  const profile = getProfile(post.author_id)
  const [reactionCounts, setReactionCounts] = useState(post.reactions)
  const [activeReaction, setActiveReaction] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const hoverTimeout = useRef(null)
  const hideTimeout = useRef(null)

  const content = post.content
  const isLong = content.length > 300
  const displayContent = isLong && !isExpanded ? content.slice(0, 300) + '...' : content
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  const totalReactions = Object.values(reactionCounts).reduce((s, v) => s + v, 0) +
    (activeReaction ? 1 : 0)

  function handleReact(key) {
    setActiveReaction(prev => prev === key ? null : key)
    setShowPopup(false)
  }

  function handleMouseEnter() {
    clearTimeout(hideTimeout.current)
    hoverTimeout.current = setTimeout(() => setShowPopup(true), 300)
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimeout.current)
    hideTimeout.current = setTimeout(() => setShowPopup(false), 200)
  }

  const currentReaction = activeReaction ? REACTIONS.find(r => r.key === activeReaction) : null

  return (
    <article className="card animate-slide-up overflow-hidden">
      {post.is_featured && (
        <div className="px-5 py-2 flex items-center gap-2"
          style={{ background: theme.highlightLight, borderBottom: `1px solid ${theme.highlight}44` }}>
          <span className="text-sm">🔥</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: theme.highlight, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Trending Right Now
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Link href={`/profile/${profile?.username}`} className="shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm hover:shadow-md transition-shadow">
              <img src={getAvatarUrl(profile?.avatar_seed)} alt={profile?.display_name} width={48} height={48} className="w-full h-full object-cover" />
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${profile?.username}`}
              className="font-semibold hover:underline"
              style={{ color: theme.dark, fontSize: '15px' }}>
              {profile?.display_name}
            </Link>
            <p className="line-clamp-1 mt-0.5" style={{ fontSize: '12px', color: theme.muted }}>{profile?.title}</p>
            <p style={{ fontSize: '12px', color: theme.muted, marginTop: '2px' }}>{timeAgo} · 🌍</p>
          </div>
          <button className="shrink-0 p-1.5 rounded-full hover:bg-[#EFE9E3] transition-colors"
            style={{ color: theme.muted, fontSize: '18px', lineHeight: 1 }}>···</button>
        </div>

        {/* Content */}
        <div className="post-content mb-4">
          {displayContent}
          {isLong && (
            <button onClick={() => setIsExpanded(!isExpanded)}
              className="font-semibold ml-1 hover:underline"
              style={{ color: theme.accent, fontSize: '14px' }}>
              {isExpanded ? 'see less' : 'see more'}
            </button>
          )}
        </div>

        {/* Reaction summary */}
        {totalReactions > 0 && (
          <div className="flex items-center justify-between pb-3 mb-1"
            style={{ borderBottom: `1px solid ${theme.sand}`, fontSize: '13px', color: theme.muted }}>
            <div className="flex items-center gap-1.5">
              <span>{REACTIONS.slice(0, 3).map(r => r.emoji).join('')}</span>
              <span>{formatNumber(totalReactions)}</span>
            </div>
            <span>{formatNumber(post.comments_count)} comments</span>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 pt-1">
          {/* Hover reaction area — covers both button AND popup with no gap */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {showPopup && <ReactionPopup onReact={handleReact} activeReaction={activeReaction} />}
            <button
              className={`reaction-bar-btn ${activeReaction ? 'reacted' : ''}`}
              onClick={() => activeReaction ? handleReact(activeReaction) : handleReact('yikes')}
            >
              <span className="text-base">{currentReaction ? currentReaction.emoji : '😬'}</span>
              <span>{currentReaction ? currentReaction.label : 'React'}</span>
            </button>
          </div>

          <button className="reaction-bar-btn">
            <span className="text-base">💬</span>
            <span>Comment</span>
          </button>

          <button className="reaction-bar-btn ml-auto">
            <span className="text-base">↗️</span>
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  )
}
