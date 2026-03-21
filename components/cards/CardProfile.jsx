'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getAvatarUrl } from '@/lib/seed-data'
import { theme } from '@/lib/theme'

export default function CardProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', session.user.id)
        .single()
      setProfile(data)
      setLoading(false)
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) { setProfile(null); setLoading(false); return }
      supabase.from('profiles').select('*').eq('auth_id', session.user.id).single()
        .then(({ data }) => { setProfile(data); setLoading(false) })
    })
    return () => subscription.unsubscribe()
  }, [])

  const isLoggedIn = !!profile
  const avatarUrl = profile?.avatar_url ||
    (profile?.avatar_seed ? getAvatarUrl(profile.avatar_seed) : null) ||
    'https://api.dicebear.com/8.x/notionists/svg?seed=default&backgroundColor=b6e3f4'

  if (loading) return (
    <div className="card overflow-hidden">
      <div className="h-14" style={{ background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent} 100%)` }} />
      <div className="px-4 pb-4 pt-10">
        <div className="h-3 rounded w-2/3 mb-2" style={{ background: theme.sand }} />
        <div className="h-2 rounded w-full mb-1" style={{ background: theme.sand }} />
        <div className="h-2 rounded w-4/5" style={{ background: theme.sand }} />
      </div>
    </div>
  )

  return (
    <div className="card overflow-hidden">
      <div className="h-14" style={{ background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent} 100%)` }} />
      <div className="px-4 pb-4">
        <div className="relative -mt-7 mb-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow">
            <img src={avatarUrl} alt={profile?.display_name || 'You'} width={56} height={56} className="w-full h-full object-cover" />
          </div>
        </div>

        {isLoggedIn ? (
          <Link href={`/profile/${profile.username}`}
            className="font-semibold hover:underline block"
            style={{ color: theme.dark, fontSize: '14px' }}>
            {profile.display_name}
          </Link>
        ) : (
          <div style={{ fontWeight: 600, color: theme.dark, fontSize: '14px' }}>You (Probably)</div>
        )}

        <div style={{ fontSize: '12px', color: theme.muted, marginTop: '2px', lineHeight: 1.4 }} className="line-clamp-2">
          {profile?.title || (isLoggedIn ? 'No headline yet — add one on your profile' : 'Sign in to post your story and connect with others.')}
        </div>

        {isLoggedIn && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.sand}` }}>
            <div className="flex justify-between mb-1.5" style={{ fontSize: '12px' }}>
              <span style={{ color: theme.muted }}>Connections</span>
              <span style={{ fontWeight: 600, color: theme.accent }}>{profile.connections || 0}</span>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.sand}` }}>
            <p style={{ fontSize: '12px', color: theme.muted, lineHeight: 1.5 }}>
              Sign in to post your story and connect with others who get it.
            </p>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {isLoggedIn ? (
            <Link href="/submit"
              className="block w-full text-center px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:opacity-80"
              style={{ border: `1.5px solid ${theme.accent}`, color: theme.accent }}>
              + Post Your Story
            </Link>
          ) : (
            <Link href="/auth"
              className="block w-full text-center px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-colors hover:opacity-80"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})` }}>
              Join Failbase
            </Link>
          )}
          <Link href="/leaderboard"
            className="block w-full text-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ background: theme.bg, color: theme.muted }}>
            🏆 Shame Board
          </Link>
        </div>
      </div>
    </div>
  )
}
