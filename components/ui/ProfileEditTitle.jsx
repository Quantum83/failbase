'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { theme } from '@/lib/theme'

export default function ProfileEditTitle({ currentTitle, authId }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(currentTitle)
  const [saved, setSaved] = useState(currentTitle)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    await supabase.from('profiles').update({ title }).eq('auth_id', authId)
    setSaved(title)
    setIsSaving(false)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={120}
          autoFocus
          className="flex-1 px-2 py-1 rounded-lg text-sm focus:outline-none"
          style={{ border: `1.5px solid ${theme.accent}`, color: theme.dark, maxWidth: '400px' }}
          placeholder='e.g. "4x Failed Founder | Still Trying"'
        />
        <button onClick={handleSave} disabled={isSaving}
          className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80"
          style={{ background: theme.accent }}>
          {isSaving ? '...' : 'Save'}
        </button>
        <button onClick={() => { setTitle(saved); setIsEditing(false) }}
          className="px-3 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
          style={{ border: `1px solid ${theme.border}`, color: theme.muted }}>
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-1 group">
      <p style={{ fontSize: '13px', color: theme.muted }}>
        {saved || <em>No headline yet — add one!</em>}
      </p>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-0.5 rounded-full"
        style={{ color: theme.accent, border: `1px solid ${theme.accent}44`, fontSize: '11px' }}>
        ✏️ Edit
      </button>
    </div>
  )
}
