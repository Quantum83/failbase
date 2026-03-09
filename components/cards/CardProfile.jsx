import Link from 'next/link'
import { getAvatarUrl } from '@/lib/seed-data'
import { theme } from '@/lib/theme'

const DEMO_PROFILE = {
  display_name: 'You (Probably)',
  title: 'Aspiring Failure | Future Failbase Regular | Still Figuring It Out',
  avatar_seed: 'DefaultUser',
  connections: 3,
}

export default function CardProfile({ profile = DEMO_PROFILE }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-14" style={{ background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent} 100%)` }} />
      <div className="px-4 pb-4">
        <div className="relative -mt-7 mb-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow">
            <img src={getAvatarUrl(profile.avatar_seed)} alt={profile.display_name} width={56} height={56} className="w-full h-full object-cover" />
          </div>
        </div>
        <div style={{ fontWeight: 600, color: theme.dark, fontSize: '14px' }}>{profile.display_name}</div>
        <div style={{ fontSize: '12px', color: theme.muted, marginTop: '2px', lineHeight: 1.4 }}>{profile.title}</div>

        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.sand}` }}>
          {[
            { label: 'Profile views', value: '2', up: true },
            { label: 'Post impressions', value: '7', up: false },
            { label: 'Shame score', value: '0 pts', special: true },
          ].map(row => (
            <div key={row.label} className="flex justify-between mb-1.5" style={{ fontSize: '12px' }}>
              <span style={{ color: theme.muted }}>{row.label}</span>
              <span style={{ fontWeight: 600, color: row.special ? theme.red : theme.accent }}>
                {row.value}
                {row.up !== undefined && (
                  <span style={{ color: row.up ? theme.accent : theme.red, marginLeft: '2px' }}>
                    {row.up ? '↑' : '↓'}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <Link href="/submit"
            className="block w-full text-center px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:opacity-80"
            style={{ border: `1.5px solid ${theme.accent}`, color: theme.accent }}>
            + Post Your Story
          </Link>
          <Link href="/leaderboard"
            className="block w-full text-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ background: theme.bg, color: theme.muted }}>
            🏆 Hall of Honesty
          </Link>
        </div>
      </div>
    </div>
  )
}
