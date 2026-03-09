const footerLinks = ['About', 'Failure Policy', 'Privacy', 'Terms of Honesty', 'Cookie Policy', 'Language']

export default function LayoutFooter() {
  return (
    <footer className="mt-16 py-8" style={{ borderTop: '1px solid #DDD8D2', background: 'white' }}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #6F8F72, #F2A65A)' }}>
            f
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#2C2C2C' }}>Failbase</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-4">
          {footerLinks.map(link => (
            <span key={link} className="cursor-pointer hover:underline transition-colors"
              style={{ fontSize: '12px', color: '#7A736C' }}>
              {link}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: '#7A736C' }}>
          Failbase © {new Date().getFullYear()} — <em>Where honesty is the whole point.</em>
        </p>
        <p style={{ fontSize: '10px', color: '#7A736C', opacity: 0.5, marginTop: '4px' }}>
          Not affiliated with LinkedIn. Results may include catharsis, community, and occasional viral humiliation.
        </p>
      </div>
    </footer>
  )
}
