import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CardFailPost from "@/components/cards/CardFailPost";
import ProfileEditFields from "@/components/ui/ProfileEditFields";
import ProfileAboutEdit from "@/components/ui/ProfileAboutEdit";
import ProfileAvatarUpload from "@/components/ui/ProfileAvatarUpload";
import {
  SEED_PROFILES,
  SEED_POSTS,
  getAvatarUrl as getSeedAvatar,
  formatNumber,
  getTotalReactions,
  getFailureScore,
} from "@/lib/seed-data";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

function formatNum(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const BADGES = [
  {
    emoji: "💀",
    label: "Legendary Loser",
    condition: (score) => score > 20000,
  },
  { emoji: "📉", label: "Serial Failer", condition: (_, count) => count >= 3 },
  {
    emoji: "🏆",
    label: "Shame Board Top 10",
    condition: (score) => score > 10000,
  },
  {
    emoji: "🌱",
    label: "Just Getting Started",
    condition: (_, count) => count >= 1 && count < 3,
  },
];

export default async function ProfilePage({ params }) {
  const supabase = createSupabaseServerClient();

  const { data: dbProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  const seedProfile = SEED_PROFILES.find((p) => p.username === params.username);

  if (!dbProfile && !seedProfile) notFound();

  const isRealUser = !!dbProfile;
  const profile = dbProfile || seedProfile;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user && dbProfile?.auth_id === user.id;

  let userPosts = [];
  if (isRealUser) {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(username, avatar_url, avatar_seed)")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });
    userPosts = (data || []).map((p) => ({
      ...p,
      username: p.profiles?.username,
      avatar_url: p.profiles?.avatar_url || null,
      avatar_seed: p.profiles?.avatar_seed || null,
    }));
  } else {
    userPosts = SEED_POSTS.filter((p) => p.author_id === profile.id);
  }

  const totalScore = isRealUser
    ? userPosts.length * 100
    : userPosts.reduce((s, p) => s + getFailureScore(p), 0);

  const totalReactions = isRealUser
    ? 0
    : userPosts.reduce((s, p) => s + getTotalReactions(p.reactions), 0);

  const earnedBadges = BADGES.filter((b) =>
    b.condition(totalScore, userPosts.length),
  );

  const avatarUrl =
    profile.avatar_url ||
    getSeedAvatar(profile.avatar_seed) ||
    `https://api.dicebear.com/8.x/notionists/svg?seed=${profile.avatar_seed}&backgroundColor=b6e3f4,c0aede`;

  const displayLocation = profile.location || "Remote (By Necessity)";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="card mb-5 overflow-hidden">
        <div
          className="h-28 sm:h-36"
          style={{
            background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent} 100%)`,
          }}
        />

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-4">
            {isOwnProfile ? (
              <ProfileAvatarUpload
                currentAvatarUrl={avatarUrl}
                authId={user.id}
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={avatarUrl}
                  alt={profile.display_name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!isOwnProfile && (
              <div className="flex gap-2 mb-1">
                <button
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                  style={{
                    border: `2px solid ${theme.dark}`,
                    color: theme.dark,
                  }}
                >
                  + Connect
                </button>
              </div>
            )}
          </div>

          {isOwnProfile ? (
            <ProfileEditFields
              currentName={profile.display_name || ""}
              currentTitle={profile.title || ""}
              currentAbout={profile.about || ""}
              currentLocation={profile.location || ""}
              currentAvatarUrl={avatarUrl}
              authId={user.id}
            />
          ) : (
            <>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: theme.dark,
                }}
              >
                {profile.display_name}
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: theme.muted,
                  marginTop: "2px",
                }}
              >
                {profile.title || "No headline yet"}
              </p>
            </>
          )}

          <div
            className="flex flex-wrap items-center gap-x-4 mt-2"
            style={{ fontSize: "13px", color: theme.muted }}
          >
            <span>📍 {displayLocation}</span>
            <span style={{ color: theme.accent, fontWeight: 600 }}>
              {formatNum(profile.connections || 0)} connections
            </span>
          </div>

          {earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {earnedBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: theme.accentLight,
                    color: theme.accent,
                    border: `1px solid ${theme.accent}44`,
                  }}
                >
                  {badge.emoji} {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5">
        <div className="flex flex-col gap-4">
          <div className="card p-4">
            <h3
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: theme.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "12px",
              }}
            >
              Stats
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Posts", value: userPosts.length },
                { label: "Reactions", value: formatNum(totalReactions) },
                {
                  label: "Connections",
                  value: formatNum(profile.connections || 0),
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-xs">
                  <span style={{ color: theme.muted }}>{row.label}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: theme.dark,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* About — with own edit button for own profile */}
          {isOwnProfile ? (
            <ProfileAboutEdit
              currentAbout={profile.about || ""}
              displayName={profile.display_name}
              authId={user.id}
            />
          ) : (
            <div className="card p-4">
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: theme.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                About
              </h3>
              <p
                style={{
                  fontSize: "12px",
                  color: theme.muted,
                  lineHeight: 1.6,
                  fontStyle: profile.about ? "normal" : "italic",
                }}
              >
                {profile.about ||
                  `"${profile.display_name} has learned from failure by failing repeatedly and with great enthusiasm."`}
              </p>
            </div>
          )}
        </div>

        <div>
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: theme.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "12px",
              paddingLeft: "4px",
            }}
          >
            Activity · {userPosts.length}{" "}
            {userPosts.length === 1 ? "post" : "posts"}
          </h2>
          {userPosts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {userPosts.map((post) => (
                <CardFailPost key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div
              className="card p-8 text-center"
              style={{ color: theme.muted }}
            >
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-sm font-medium">No posts yet.</p>
              {isOwnProfile && (
                <Link
                  href="/submit"
                  className="inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
                  }}
                >
                  Post your first failure →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
