'use client'
import { useState } from 'react'

export default function ButtonShare({ text = "Check out this professional failure on Failbase 😭", url }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const shareText = `${text}\n\n${url || window.location.href}`
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all
        ${copied
          ? 'bg-green-50 border-green-500 text-green-700'
          : 'bg-white border-fb-charcoal text-fb-charcoal hover:bg-fb-charcoal hover:text-white'
        }`}
    >
      <span>{copied ? '✅' : '↗️'}</span>
      {copied ? 'Shame Shared!' : 'Share This Failure'}
    </button>
  )
}
