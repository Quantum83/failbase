import { supabase } from './supabase'

export async function signUpWithEmail(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  return { data, error }
}

export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function createOrUpdateProfile(user) {
  const existingProfile = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (existingProfile.data) return existingProfile.data

  const username = user.email?.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase() +
    '_' + Math.random().toString(36).slice(2, 6)

  const { data, error } = await supabase.from('profiles').insert({
    auth_id: user.id,
    username,
    display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url || null,
    avatar_seed: username,
    title: '',
  }).select().single()

  return data
}

export async function updateProfileTitle(authId, title) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ title })
    .eq('auth_id', authId)
  return { data, error }
}

export async function getProfileByAuthId(authId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', authId)
    .single()
  return data
}
