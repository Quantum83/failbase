'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { theme } from '@/lib/theme'

const TITLE_SUGGESTIONS = [
  'Ex-Founder | Currently Regrouping',
  'Serial Entrepreneur (emphasis on serial)',
  'Thought Leader (Self-Appointed)',
  'Chief Pivot Officer',
  'Professional Failure Enthusiast',
  'Aspiring Success Story | Not There Yet',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth')
      else setUser(user)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) return
    setIsLoading(true)

    await supabase
      .from('profiles')
      .update({ title })
      .eq('auth_id', user.id)

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: theme.bg }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👋</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: theme.dark, marginBottom: '8px' }}>
            One last thing
          </h1>
          <p style={{ fontSize: '14px', color: theme.muted }}>
            What's your professional title? <br />
            <em>The more creative the better.</em>
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                Your headline
              </label>
              <input
                type="text"
                placeholder='e.g. "4x Failed Founder | Still Trying"'
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={120}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ border: `1.5px solid ${theme.border}`, color: theme.dark }}
              />
              <p style={{ fontSize: '11px', color: theme.muted, marginTop: '4px', textAlign: 'right' }}>
                {120 - title.length} chars left
              </p>
            </div>

            {/* Suggestions */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 600, color: theme.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Need inspiration?
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TITLE_SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTitle(s)}
                    className="text-xs px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
                    style={{ background: theme.accentLight, color: theme.accent, border: `1px solid ${theme.accent}44` }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})` }}>
              {isLoading ? '⏳ Setting up your profile...' : "Let's go 📉"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
