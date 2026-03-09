export default function CardStatsWidget() {
  return (
    <div className="card p-4">
      <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#7A736C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
        Failbase Today
      </h3>
      <div className="flex flex-col gap-2.5">
        {[
          { emoji: '📉', label: 'Startups wound down', value: '47', delta: '+12%' },
          { emoji: '😭', label: 'Posts deleted in shame', value: '8,204', delta: '+3%' },
          { emoji: '💼', label: 'Open to Work', value: '1.2M', delta: '+8%' },
          { emoji: '🧠', label: '"Pivots" announced', value: '892', delta: '+22%' },
          { emoji: '✨', label: 'People "grateful for the journey"', value: 'All', delta: '' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{row.emoji}</span>
              <span style={{ fontSize: '12px', color: '#7A736C', lineHeight: 1.3 }}>{row.label}</span>
            </div>
            <div className="text-right shrink-0">
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#2C2C2C' }}>{row.value}</span>
              {row.delta && <span style={{ fontSize: '10px', color: '#C0392B', marginLeft: '3px' }}>{row.delta}</span>}
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '10px', color: '#7A736C', opacity: 0.6, fontStyle: 'italic', marginTop: '10px' }}>
        * Made up. Like your startup's traction metrics.
      </p>
    </div>
  )
}
