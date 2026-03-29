import CardLeaderboardEntry from "@/components/cards/CardLeaderboardEntry";
import CardTrendingTopics from "@/components/cards/CardTrendingTopics";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  SEED_POSTS,
  SEED_PROFILES,
  REACTIONS,
  formatNumber,
  getTotalReactions,
  getSeedLeaderboard,
  QUOTES,
  getDateSeeded,
} from "@/lib/seed-data";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shame Board | Failbase",
  description:
    "The definitive ranking of professional failures. Updated in real-time as careers collapse.",
};

export default async function LeaderboardPage() {
  const supabase = createSupabaseServerClient();

  // Fetch all real posts
  const { data: realPosts } = await supabase
    .from("posts")
    .select(
      "*, profiles(id, username, display_name, title, avatar_url, avatar_seed)",
    )
    .order("created_at", { ascending: false });

  let rankedUsers = [];
  let hasRealPosts = (realPosts?.length || 0) > 0;

  if (hasRealPosts) {
    // Aggregate scores by user
    const userScores = {};

    realPosts.forEach((post) => {
      const userId = post.author_id;
      if (!userScores[userId]) {
        userScores[userId] = {
          id: userId,
          username: post.profiles?.username,
          display_name: post.profiles?.display_name,
          title: post.profiles?.title,
          avatar_url: post.profiles?.avatar_url,
          avatar_seed: post.profiles?.avatar_seed,
          posts: 0,
          totalReactions: 0,
          totalComments: 0,
          totalScore: 0,
        };
      }
      userScores[userId].posts += 1;
    });

    const userIds = Object.keys(userScores);

    if (userIds.length > 0) {
      // Fetch all reactions for all posts by these users
      const { data: allReactions } = await supabase
        .from("reactions")
        .select("post_id")
        .in(
          "post_id",
          realPosts.map((p) => p.id),
        );

      const reactionsByPost = {};
      (allReactions || []).forEach((r) => {
        reactionsByPost[r.post_id] = (reactionsByPost[r.post_id] || 0) + 1;
      });

      // Fetch all comments for all posts by these users
      const { data: allComments } = await supabase
        .from("comments")
        .select("post_id")
        .in(
          "post_id",
          realPosts.map((p) => p.id),
        );

      const commentsByPost = {};
      (allComments || []).forEach((c) => {
        commentsByPost[c.post_id] = (commentsByPost[c.post_id] || 0) + 1;
      });

      // Calculate totals per user
      realPosts.forEach((post) => {
        const userId = post.author_id;
        const reactionCount = reactionsByPost[post.id] || 0;
        const commentCount = commentsByPost[post.id] || 0;
        const postScore = 5 + reactionCount + commentCount * 3;

        userScores[userId].totalReactions += reactionCount;
        userScores[userId].totalComments += commentCount;
        userScores[userId].totalScore += postScore;
      });
    }

    rankedUsers = Object.values(userScores).sort(
      (a, b) => b.totalScore - a.totalScore,
    );
  } else {
    // No real posts yet, show seed leaderboard
    rankedUsers = getSeedLeaderboard();
  }

  // Combined stats
  const seedReactionsTotal = SEED_POSTS.reduce(
    (s, p) => s + getTotalReactions(p.reactions),
    0,
  );
  const { count: realReactionCount } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true });
  const { count: realProfileCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .not("auth_id", "is", null);

  const totalPosts = (realPosts?.length || 0) + SEED_POSTS.length;
  const totalReactions = (realReactionCount || 0) + seedReactionsTotal;
  const totalProfiles = (realProfileCount || 0) + SEED_PROFILES.length;

  // Daily rotating quote
  const todayQuote = getDateSeeded(QUOTES, 1, 2)[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="card mb-6 overflow-hidden">
        <div
          className="p-6 text-white relative"
          style={{
            background: `linear-gradient(135deg, ${theme.dark}, ${theme.accent})`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(-45deg, transparent, transparent 30px, rgba(255,255,255,0.03) 30px, rgba(255,255,255,0.03) 60px)",
            }}
          />
          <div className="relative z-10">
            <div
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              The Official
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              🏆 Failbase Shame Board
            </h1>
            <p
              className="text-sm max-w-lg"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              A living monument to professional honesty. Ranked by shame score:
              a proprietary metric combining reactions, comments, and sheer
              vulnerability.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px"
          style={{ background: theme.border }}
        >
          {[
            {
              emoji: "📉",
              label: "Failures Posted",
              value: totalPosts.toString(),
              sub: "and counting",
            },
            {
              emoji: "😬",
              label: "Total Reactions",
              value: formatNumber(totalReactions),
              sub: "expressions of sympathy",
            },
            {
              emoji: "💀",
              label: "Active Disasters",
              value: rankedUsers.length.toString(),
              sub: hasRealPosts ? "real users ranked" : "demo profiles",
            },
            {
              emoji: "🤝",
              label: "Professionals Humbled",
              value: totalProfiles.toString(),
              sub: "brave souls",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white p-4 text-center">
              <div className="text-2xl mb-0.5">{s.emoji}</div>
              <div
                className="text-xl font-bold font-mono"
                style={{ color: theme.dark }}
              >
                {s.value}
              </div>
              <div
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: theme.muted }}
              >
                {s.label}
              </div>
              <div
                className="text-[10px] mt-0.5"
                style={{ color: theme.muted, opacity: 0.6 }}
              >
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        {/* Leaderboard */}
        <div>
          {/* Formula legend */}
          <div className="card p-3 mb-4 flex flex-wrap items-center gap-3">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: theme.muted }}
            >
              Shame Score =
            </span>
            <span className="text-xs" style={{ color: theme.muted }}>
              😬😭💀😔 Reactions + 💬 Comments × 3 + 📝 Posts × 5
            </span>
          </div>

          {/* Ranked entries */}
          <div className="flex flex-col gap-3">
            {rankedUsers.map((user, i) => (
              <div
                key={user.id}
                className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`}
              >
                <CardLeaderboardEntry user={user} rank={i + 1} />
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div
            className="card mt-5 p-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${theme.bg}, white)`,
            }}
          >
            <div className="text-4xl mb-3">📉</div>
            <h3
              className="font-bold text-xl mb-2"
              style={{
                fontFamily: "var(--font-display)",
                color: theme.dark,
              }}
            >
              Think you can do worse?
            </h3>
            <p className="text-sm mb-4" style={{ color: theme.muted }}>
              These legends didn&apos;t become Failbase icons by staying quiet
              about their disasters.
              <br />
              Your failure deserves an audience.
            </p>
            <a
              href="/submit"
              className="inline-block px-6 py-3 text-white rounded-full font-bold text-sm transition-opacity hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
              }}
            >
              💀 Submit Your Failure to History
            </a>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:flex flex-col gap-4">
          <CardTrendingTopics />

          {/* Quote of the Day */}
          <div className="card p-4">
            <div
              className="text-[10px] uppercase tracking-widest mb-2"
              style={{ color: theme.muted }}
            >
              Quote of the Day
            </div>
            <blockquote
              className="text-sm italic leading-relaxed pl-3"
              style={{
                color: theme.dark,
                borderLeft: `4px solid ${theme.highlight}`,
              }}
            >
              &ldquo;{todayQuote.text}&rdquo;
            </blockquote>
            <p className="text-xs mt-2" style={{ color: theme.muted }}>
              | {todayQuote.author}
            </p>
          </div>

          {/* Shame tiers */}
          <div className="card p-4">
            <div
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: theme.muted }}
            >
              Shame Tiers
            </div>
            <div className="space-y-2">
              {[
                {
                  tier: "Grand Champion",
                  range: "500+ pts",
                  color: theme.highlight,
                  bold: true,
                  emoji: "🥇",
                },
                {
                  tier: "Distinguished Loser",
                  range: "150–499",
                  color: theme.muted,
                  bold: true,
                  emoji: "🥈",
                },
                {
                  tier: "Certified Disaster",
                  range: "50–149",
                  color: theme.muted,
                  bold: true,
                  emoji: "🥉",
                },
                {
                  tier: "Aspiring Failure",
                  range: "10–49",
                  color: theme.muted,
                  bold: false,
                  emoji: "📉",
                },
                {
                  tier: "Just Getting Started",
                  range: "0–9",
                  color: theme.muted,
                  bold: false,
                  emoji: "🌱",
                },
              ].map((t) => (
                <div
                  key={t.tier}
                  className="flex justify-between items-center text-xs"
                >
                  <span>
                    {t.emoji}{" "}
                    <span
                      style={{
                        color: t.color,
                        fontWeight: t.bold ? 600 : 400,
                      }}
                    >
                      {t.tier}
                    </span>
                  </span>
                  <span className="font-mono" style={{ color: theme.muted }}>
                    {t.range}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
