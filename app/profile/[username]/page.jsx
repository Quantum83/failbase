import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ProfileEditFields from "@/components/ui/ProfileEditFields";
import ProfileAboutEdit from "@/components/ui/ProfileAboutEdit";
import ProfileAvatarUpload from "@/components/ui/ProfileAvatarUpload";
import ProfileActivityTabs from "@/components/ui/ProfileActivityTabs";
import AchievementModalWrapper from "@/components/ui/AchievementModalWrapper";
import {
  SEED_PROFILES,
  SEED_POSTS,
  getAvatarUrl as getSeedAvatar,
  getTotalReactions,
} from "@/lib/seed-data";
import { theme } from "@/lib/theme";
import SignOutButton from "@/components/ui/SignOutButton";

export async function generateMetadata({ params }) {
  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, title, about")
    .eq("username", params.username)
    .single();

  if (profile) {
    const title = profile.title
      ? `${profile.display_name} | ${profile.title}`
      : profile.display_name;
    const description = profile.about
      ? profile.about.slice(0, 155)
      : profile.title ||
        `${profile.display_name}'s failure profile on Failbase`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} | Failbase`,
        description,
        type: "profile",
        url: `https://failbase.win/profile/${params.username}`,
        images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      },
      twitter: { card: "summary", title: `${title} | Failbase`, description },
    };
  }

  const seedProfile = SEED_PROFILES.find((p) => p.username === params.username);
  if (seedProfile) {
    const title = seedProfile.title
      ? `${seedProfile.display_name} | ${seedProfile.title}`
      : seedProfile.display_name;

    return {
      title,
      description: seedProfile.title || "A fictional professional on Failbase",
      openGraph: {
        title: `${title} | Failbase`,
        description:
          seedProfile.title || "A fictional professional on Failbase",
        type: "profile",
        url: `https://failbase.win/profile/${params.username}`,
        images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      },
    };
  }

  return { title: "Profile Not Found" };
}

export const dynamic = "force-dynamic";

function formatNum(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const ACHIEVEMENTS = [
  {
    emoji: "🌱",
    label: "Just Getting Started",
    description: "Joined Failbase. Brave already.",
    condition: (_, count) => count === 0,
  },
  {
    emoji: "🎤",
    label: "First Fall",
    description: "Posted your first failure",
    condition: (_, count) => count >= 1,
  },
  {
    emoji: "💀",
    label: "Serial Failer",
    description: "Posted 3+ failures",
    condition: (_, count) => count >= 3,
  },
  {
    emoji: "🔥",
    label: "Can't Stop Won't Stop",
    description: "Posted 7+ failures",
    condition: (_, count) => count >= 7,
  },
  {
    emoji: "😬",
    label: "Crowd Cringed",
    description: "Earned 25+ shame points",
    condition: (score) => score >= 25,
  },
  {
    emoji: "📢",
    label: "Public Meltdown",
    description: "Earned 100+ shame points",
    condition: (score) => score >= 100,
  },
  {
    emoji: "🎪",
    label: "Main Character Energy",
    description: "Earned 300+ shame points",
    condition: (score) => score >= 300,
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

  const isSeedInDb = !!dbProfile && !dbProfile.auth_id && !!seedProfile;
  const isRealUser = !!dbProfile && !isSeedInDb;
  const profile = isRealUser ? dbProfile : seedProfile || dbProfile;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user && isRealUser && dbProfile?.auth_id === user.id;

  let currentUserId = null;
  if (user) {
    if (dbProfile?.auth_id === user.id) {
      currentUserId = dbProfile.id;
    } else {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .single();
      currentUserId = myProfile?.id || null;
    }
  }

  let userPosts = [];
  let userComments = [];

  if (isRealUser) {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(username, avatar_url, avatar_seed)")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });

    const posts = (data || []).map((p) => ({
      ...p,
      username: p.profiles?.username,
      avatar_url: p.profiles?.avatar_url || null,
      avatar_seed: p.profiles?.avatar_seed || null,
    }));

    if (posts.length > 0) {
      const postIds = posts.map((p) => p.id);

      const { data: allReactions } = await supabase
        .from("reactions")
        .select("post_id, reaction_key, user_id")
        .in("post_id", postIds);

      const reactionsByPost = {};
      const userReactionsByPost = {};

      (allReactions || []).forEach((r) => {
        if (!reactionsByPost[r.post_id]) {
          reactionsByPost[r.post_id] = {
            yikes: 0,
            same: 0,
            skull: 0,
            understandable: 0,
          };
        }
        reactionsByPost[r.post_id][r.reaction_key]++;
        if (currentUserId && r.user_id === currentUserId) {
          userReactionsByPost[r.post_id] = r.reaction_key;
        }
      });

      const { data: commentRows } = await supabase
        .from("comments")
        .select("post_id")
        .in("post_id", postIds);

      const commentCountsByPost = {};
      (commentRows || []).forEach((c) => {
        commentCountsByPost[c.post_id] =
          (commentCountsByPost[c.post_id] || 0) + 1;
      });

      userPosts = posts.map((p) => ({
        ...p,
        reactions: reactionsByPost[p.id] || {
          yikes: 0,
          same: 0,
          skull: 0,
          understandable: 0,
        },
        userReaction: userReactionsByPost[p.id] || null,
        comments_count: commentCountsByPost[p.id] || 0,
      }));
    } else {
      userPosts = posts;
    }

    const { data: comments } = await supabase
      .from("comments")
      .select("*, posts(id, content, author_name)")
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });
    userComments = comments || [];
  } else {
    const seedId = seedProfile?.id;
    userPosts = seedId ? SEED_POSTS.filter((p) => p.author_id === seedId) : [];
  }

  const totalReactions = userPosts.reduce(
    (s, p) => s + getTotalReactions(p.reactions || {}),
    0,
  );
  const totalComments = userPosts.reduce(
    (s, p) => s + (p.comments_count || 0),
    0,
  );
  const totalScore = userPosts.length * 5 + totalReactions + totalComments * 3;

  const earnedBadges = ACHIEVEMENTS.filter((a) =>
    a.condition(totalScore, userPosts.length),
  );

  const avatarUrl =
    profile.avatar_url ||
    getSeedAvatar(profile.avatar_seed) ||
    `https://api.dicebear.com/8.x/notionists/svg?seed=${profile.avatar_seed}&backgroundColor=b6e3f4,c0aede`;

  const displayLocation = profile.location || "Remote (By Necessity)";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {!isRealUser && (
        <div
          className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
          style={{
            background: theme.highlightLight,
            border: `1px solid ${theme.highlight}44`,
          }}
        >
          <span>🎭</span>
          <p
            style={{
              fontSize: "13px",
              color: theme.highlight,
              fontWeight: 500,
            }}
          >
            This is a fictional profile created for demo purposes. Not a real
            person.
          </p>
        </div>
      )}

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
            <div className="flex gap-2 mb-1">
              {isOwnProfile ? (
                <SignOutButton />
              ) : (
                <button
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                  style={{
                    border: `2px solid ${theme.dark}`,
                    color: theme.dark,
                  }}
                >
                  + Connect
                </button>
              )}
            </div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5 w-full">
        <div className="flex flex-col gap-4">
          {/* About */}
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
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-line",
                }}
              >
                {profile.about ||
                  `"${profile.display_name} has learned from failure by failing repeatedly and with great enthusiasm."`}
              </p>
            </div>
          )}

          {/* Shame Score */}
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
              Shame Score
            </h3>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: theme.accent,
                fontFamily: "var(--font-mono)",
                lineHeight: 1,
              }}
            >
              {formatNum(totalScore)}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: theme.muted,
                marginTop: "2px",
                marginBottom: "12px",
              }}
            >
              points
            </div>
            <div
              className="flex flex-col gap-1.5"
              style={{
                borderTop: `1px solid ${theme.border}`,
                paddingTop: "10px",
              }}
            >
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span style={{ color: theme.muted }} className="shrink-0">
                  Posts (×5)
                </span>
                <span
                  style={{
                    color: theme.dark,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatNum(userPosts.length * 5)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span style={{ color: theme.muted }} className="shrink-0">
                  Reactions
                </span>
                <span
                  style={{
                    color: theme.dark,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatNum(totalReactions)}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span style={{ color: theme.muted }} className="shrink-0">
                  Comments (×3)
                </span>
                <span
                  style={{
                    color: theme.dark,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatNum(totalComments * 3)}
                </span>
              </div>
              <div
                className="flex items-baseline justify-between gap-2 text-xs"
                style={{
                  borderTop: `1px solid ${theme.border}`,
                  paddingTop: "6px",
                  marginTop: "4px",
                }}
              >
                <span
                  style={{ color: theme.muted, fontWeight: 600 }}
                  className="shrink-0"
                >
                  Total
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: theme.accent,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatNum(totalScore)}
                </span>
              </div>
            </div>
            <div
              className="flex items-center gap-1 mt-3"
              style={{ fontSize: "11px", color: theme.muted }}
            >
              <span>👥</span>
              <span style={{ fontWeight: 600 }}>
                {formatNum(profile.connections || 0)}
              </span>
              <span>connections</span>
            </div>
          </div>

          {/* Achievements */}
          {earnedBadges.length > 0 && (
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
                Achievements
              </h3>
              <div className="flex flex-col gap-3">
                {earnedBadges.map((badge) => (
                  <div key={badge.label}>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: theme.accentLight,
                        color: theme.accent,
                        border: `1px solid ${theme.accent}44`,
                      }}
                    >
                      {badge.emoji} {badge.label}
                    </span>
                    <p
                      style={{
                        fontSize: "11px",
                        color: theme.muted,
                        marginTop: "4px",
                        paddingLeft: "4px",
                      }}
                    >
                      {badge.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity */}
        <ProfileActivityTabs
          posts={userPosts}
          comments={userComments}
          currentUserId={currentUserId}
          isOwnProfile={isOwnProfile}
          username={profile.username}
        />
      </div>
      {isOwnProfile && (
        <AchievementModalWrapper
          achievements={earnedBadges.map(({ emoji, label, description }) => ({
            emoji,
            label,
            description,
          }))}
          profileId={profile.id}
        />
      )}
    </div>
  );
}
