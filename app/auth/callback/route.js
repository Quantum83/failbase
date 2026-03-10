import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create profile if it doesn't exist
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, title')
        .eq('auth_id', data.user.id)
        .single()

      if (!existing) {
        const username = (data.user.email?.split('@')[0] || 'user')
          .replace(/[^a-z0-9_]/gi, '_').toLowerCase() +
          '_' + Math.random().toString(36).slice(2, 6)

        await supabase.from('profiles').insert({
          auth_id: data.user.id,
          username,
          display_name: data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0],
          email: data.user.email,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          avatar_seed: username,
          title: '',
        })

        // New user — send to onboarding
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Existing user with no title — send to onboarding
      if (!existing.title) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=Could not sign in`)
}
