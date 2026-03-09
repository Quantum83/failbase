'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FAILURE_CATEGORIES = [
  { key: 'startup', label: '💸 Startup Failure', placeholder: 'How much did you raise before running out?' },
  { key: 'career', label: '💼 Career Implosion', placeholder: 'Which bridge did you burn first?' },
  { key: 'investment', label: '📉 Investment Disaster', placeholder: 'NFTs? Crypto? Both?' },
  { key: 'pitch', label: '🎤 Pitch Humiliation', placeholder: 'How many sharks said no?' },
  { key: 'personal_brand', label: '🤡 Personal Brand Crisis', placeholder: 'What did you claim to be that you weren\'t?' },
  { key: 'other', label: '🌀 General Life Collapse', placeholder: 'Describe your specific flavor of chaos.' },
]

const PROMPTS = [
  "Excited to announce that...",
  "I want to be transparent with my network...",
  "Hot take: losing everything was the BEST thing...",
  "Normalizing failure. Here's mine:",
  "I need to be honest with my network...",
  "Plot twist:",
]

const MAX_CHARS = 1200

export default function SubmitPage() {
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [title, setTitle] = useState('')

  const charsLeft = MAX_CHARS - content.length
  const isOverLimit = charsLeft < 0
  const canSubmit = content.length > 20 && !isOverLimit && displayName.length > 0

  function handlePrompt(prompt) {
    setContent(prompt + ' ')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setIsSubmitting(true)
    // Simulate save — in production this would save to Supabase
    await new Promise(r => setTimeout(r, 1200))
    setIsSubmitting(false)
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card p-10 animate-slide-up">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="font-display text-3xl font-bold text-fb-charcoal mb-3">
            Failure Successfully Submitted
          </h2>
          <p className="text-fb-muted mb-2">
            Your disaster has been received by the Failbase team. <br />
            We are honored by your vulnerability and poor decisions.
          </p>
          <p className="text-sm text-fb-muted/70 mb-6 italic">
            Once Supabase is connected, this will save to the live database and appear in the feed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setShowSuccess(false); setContent(''); setDisplayName(''); setTitle(''); setCategory('') }}
              className="px-5 py-2.5 bg-fb-charcoal text-white rounded-full font-bold text-sm hover:bg-black transition-colors"
            >
              Post Another Failure
            </button>
            <a
              href="/"
              className="px-5 py-2.5 border-2 border-fb-border text-fb-muted rounded-full font-semibold text-sm hover:bg-fb-cream transition-colors"
            >
              Return to Feed
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-fb-muted mb-1">Share with your network</div>
        <h1 className="font-display text-3xl font-bold text-fb-charcoal">Post Your Failure</h1>
        <p className="text-fb-muted mt-1 text-sm">
          Be the professional you were always too scared to be: deeply, publicly, relatable.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Author info */}
        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-fb-muted mb-4">Your Professional Identity</h2>
          <div className="flex gap-3 items-start">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-fb-cream">
              <img
                src="https://api.dicebear.com/8.x/notionists/svg?seed=newuser&backgroundColor=d1d4f9"
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your name (or alias — we won't judge)"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full border border-fb-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-fb-blue transition-colors"
                required
              />
              <input
                type="text"
                placeholder='Your title (e.g. "Ex-Founder | Currently Regrouping")'
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-fb-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-fb-blue transition-colors text-fb-muted"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-fb-muted mb-3">Type of Failure</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FAILURE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`text-left px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all
                  ${category === cat.key
                    ? 'border-fb-charcoal bg-fb-charcoal text-white'
                    : 'border-fb-border text-fb-muted hover:border-fb-blue hover:text-fb-blue'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-fb-muted">Your Failure</h2>
            <span className={`text-xs font-mono ${isOverLimit ? 'text-fb-red font-bold' : 'text-fb-muted'}`}>
              {charsLeft} chars left
            </span>
          </div>

          {/* Prompt starters */}
          <div className="mb-3">
            <p className="text-[11px] text-fb-muted mb-2 uppercase tracking-wide">Classic openings:</p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePrompt(p)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-fb-border text-fb-muted hover:border-fb-blue hover:text-fb-blue transition-colors font-medium"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={
              category
                ? FAILURE_CATEGORIES.find(c => c.key === category)?.placeholder
                : "Tell your network exactly what went wrong. Be specific. Be honest. Add gratuitous hashtags. The algorithm rewards vulnerability (and chaos)."
            }
            rows={10}
            className={`w-full border rounded-lg px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none transition-colors
              ${isOverLimit ? 'border-fb-red' : 'border-fb-border focus:border-fb-blue'}`}
          />

          <div className="mt-2 flex items-center gap-3">
            <div className="flex gap-2">
              {['📉', '💸', '😭', '🤡', '🚨'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setContent(c => c + emoji)}
                  className="text-lg hover:scale-125 transition-transform"
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <span className="text-xs text-fb-muted">Add emotional context</span>
          </div>
        </div>

        {/* Visibility & disclaimer */}
        <div className="card p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-fb-muted mb-3">Visibility</h2>
          <div className="flex items-center justify-between py-2 border border-fb-border rounded-lg px-3 bg-fb-cream">
            <div className="flex items-center gap-2">
              <span className="text-base">🌍</span>
              <div>
                <div className="text-sm font-semibold text-fb-charcoal">Public — Everyone</div>
                <div className="text-xs text-fb-muted">Your failure deserves the widest possible audience.</div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-fail-shame bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Required
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={`w-full py-3.5 rounded-full font-bold text-base transition-all
            ${canSubmit && !isSubmitting
              ? 'bg-fb-charcoal text-white hover:bg-black shadow-lg hover:shadow-xl active:scale-[0.99]'
              : 'bg-fb-border text-fb-muted cursor-not-allowed'
            }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Submitting to Shame...
            </span>
          ) : (
            '💀 Post This Failure to the World'
          )}
        </button>

        <p className="text-center text-xs text-fb-muted">
          By posting, you confirm that this failure is yours and you own it fully. <br />
          <em>No refunds on public humiliation.</em>
        </p>
      </form>
    </div>
  )
}
