const TRENDING = [
  { tag: '#StartupFail', count: '4,203 posts', emoji: '📉' },
  { tag: '#OpenToWork', count: '92K posts', emoji: '🚨' },
  { tag: '#NFTInvestor', count: '1.1K posts', emoji: '🐒' },
  { tag: '#FounderLife', count: '18K posts', emoji: '😭' },
  { tag: '#Web3Believer', count: '802 posts', emoji: '💀' },
  { tag: '#7FigureBusiness', count: '34K posts', emoji: '🤡' },
]

export default function CardTrendingTopics() {
  return (
    <div className="card p-4">
      <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#7A736C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
        Trending Stories
      </h3>
      <div className="flex flex-col gap-2.5">
        {TRENDING.map((item) => (
          <div key={item.tag} className="flex items-center justify-between group cursor-pointer">
            <div>
              <div className="font-semibold group-hover:underline transition-colors" style={{ fontSize: '13px', color: '#2C2C2C' }}>
                {item.emoji} {item.tag}
              </div>
              <div style={{ fontSize: '11px', color: '#7A736C' }}>{item.count}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-3 text-xs font-semibold hover:underline" style={{ color: '#6F8F72' }}>
        Show all →
      </button>
    </div>
  )
}
