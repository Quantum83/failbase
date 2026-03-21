'use client'
import { useState } from 'react'
import { theme } from '@/lib/theme'

export function useToast() {
  const [toast, setToast] = useState(null)

  function showToast(message, emoji = '✅') {
    setToast({ message, emoji })
    setTimeout(() => setToast(null), 2500)
  }

  return { toast, showToast }
}

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div
      className="fixed z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg animate-slide-up"
      style={{
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: theme.dark,
        color: 'white',
        fontSize: '14px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{toast.emoji}</span>
      <span>{toast.message}</span>
    </div>
  )
}
