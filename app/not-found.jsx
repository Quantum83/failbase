import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="card p-12">
        <div className="text-6xl mb-4">📉</div>
        <h1 className="font-display text-4xl font-bold text-fb-charcoal mb-3">404</h1>
        <h2 className="text-xl font-semibold text-fb-charcoal mb-2">Page Not Found</h2>
        <p className="text-fb-muted text-sm mb-1">
          This page failed to exist. We're choosing to see that as growth.
        </p>
        <p className="text-fb-muted/60 text-xs mb-8 italic">
          Error 404 is actually a learning opportunity.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="px-5 py-2.5 bg-fb-charcoal text-white rounded-full font-bold text-sm hover:bg-black transition-colors">
            Return to Feed
          </Link>
          <Link href="/submit" className="px-5 py-2.5 border-2 border-fb-border text-fb-muted rounded-full font-semibold text-sm hover:bg-fb-cream transition-colors">
            Post a Failure Instead
          </Link>
        </div>
      </div>
    </div>
  )
}
