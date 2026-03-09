'use client'
import { useState, useMemo } from 'react'
import CardFailPost from '@/components/cards/CardFailPost'
import { getTotalReactions, getFailureScore } from '@/lib/seed-data'
import { theme } from '@/lib/theme'

const SORTS = [
  { key: 'shameful', label: '🔥 Most Shameful' },
  { key: 'recent', label: '🕐 Most Recent' },
  { key: 'relatable', label: '😭 Most Relatable' },
]

export default function FeedSorter({ posts }) {
  const [activeSort, setActiveSort] = useState('shameful')

  const sorted = useMemo(() => {
    const copy = [...posts]
    if (activeSort === 'shameful') return copy.sort((a, b) => getFailureScore(b) - getFailureScore(a))
    if (activeSort === 'recent') return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (activeSort === 'relatable') return copy.sort((a, b) => (b.reactions.same + b.reactions.understandable) - (a.reactions.same + a.reactions.understandable))
    return copy
  }, [posts, activeSort])

  return (
    <>
      <div className="card p-3 flex items-center gap-2 flex-wrap">
        <span style={{ fontSize: '12px', color: theme.muted, fontWeight: 500 }}>Sort by:</span>
        <div className="flex gap-1.5 flex-wrap">
          {SORTS.map((sort) => (
            <button
              key={sort.key}
              onClick={() => setActiveSort(sort.key)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
              style={activeSort === sort.key
                ? { background: theme.accent, color: 'white' }
                : { color: theme.muted, background: 'transparent' }
              }
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.map((post, i) => (
        <div key={post.id} className={`stagger-${Math.min(i + 1, 5)}`}>
          <CardFailPost post={post} />
        </div>
      ))}
    </>
  )
}
