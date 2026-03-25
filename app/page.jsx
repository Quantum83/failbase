import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import FeedSorter from "@/components/ui/FeedSorter";
import CardProfile from "@/components/cards/CardProfile";
import CardStatsWidget from "@/components/cards/CardStatsWidget";
import CardTrendingTopics from "@/components/cards/CardTrendingTopics";
import {
  SEED_POSTS,
  SEED_PROFILES,
  getProfile,
  getAvatarUrl,
  getDateSeeded,
} from "@/lib/seed-data";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Failbase | Where Professionals Come to Be Honest",
};

function getSnippet(content, maxLen = 120) {
  if (!content) return "";
  const clean = content.replace(/\n+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).trim() + "...";
}

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_id", user.id)
      .single();
    userProfile = data;
  }

  const { data: realPosts } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url, avatar_seed)")
    .order("created_at", { ascending: false })
    .limit(20);

  const postIds = (realPosts || []).map((p) => p.id);
  let reactionsByPost = {};
  let userReactionsByPost = {};
  let commentCountsByPost = {};

  if (postIds.length > 0) {
    const { data: allReactions } = await supabase
      .from("reactions")
      .select("post_id, reaction_key, user_id")
      .in("post_id", postIds);

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
    });

    if (userProfile) {
      (allReactions || []).forEach((r) => {
        if (r.user_id === userProfile.id) {
          userReactionsByPost[r.post_id] = r.reaction_key;
        }
      });
    }

    const { data: commentRows } = await supabase
      .from("comments")
      .select("post_id")
      .in("post_id", postIds);

    (commentRows || []).forEach((c) => {
      commentCountsByPost[c.post_id] =
        (commentCountsByPost[c.post_id] || 0) + 1;
    });
  }

  // Find trending post (most reactions among real posts in last 48hrs)
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  let trendingPostId = null;
  let trendingPostData = null;

  const recentRealPosts = (realPosts || []).filter(
    (p) => p.created_at > cutoff,
  );
  if (recentRealPosts.length > 0) {
    let maxReactions = 0;
    recentRealPosts.forEach((p) => {
      const counts = reactionsByPost[p.id] || {
        yikes: 0,
        same: 0,
        skull: 0,
        understandable: 0,
      };
      const total = Object.values(counts).reduce((s, v) => s + v, 0);
      if (total > maxReactions) {
        maxReactions = total;
        trendingPostId = p.id;
        trendingPostData = p;
      }
    });
    // Only feature if it has at least 1 reaction
    if (maxReactions < 1) {
      trendingPostId = null;
      trendingPostData = null;
    }
  }

  const formattedRealPosts = (realPosts || []).map((p) => ({
    ...p,
    username: p.profiles?.username,
    avatar_url: p.profiles?.avatar_url || null,
    avatar_seed: p.profiles?.avatar_seed || null,
    reactions: reactionsByPost[p.id] || {
      yikes: 0,
      same: 0,
      skull: 0,
      understandable: 0,
    },
    userReaction: userReactionsByPost[p.id] || null,
    comments_count: commentCountsByPost[p.id] || 0,
    is_featured: p.id === trendingPostId,
  }));

  const allPosts = [...formattedRealPosts, ...SEED_POSTS];

  // Story of the Week: trending real post or daily-rotating seed fallback
  let storyOfWeek;
  if (trendingPostData) {
    storyOfWeek = {
      name: trendingPostData.author_name,
      snippet: getSnippet(trendingPostData.content),
      href: `/post/${trendingPostData.id}`,
    };
  } else {
    const seedPick = getDateSeeded(SEED_POSTS, 1, 5)[0];
    const seedAuthor = getProfile(seedPick.author_id);
    storyOfWeek = {
      name: seedAuthor?.display_name || "Anonymous",
      snippet: getSnippet(seedPick.content),
      href: `/post/${seedPick.id}`,
    };
  }

  // People Who Get It — real users first, seed fallback to fill 3 spots
  let peopleQuery = supabase
    .from("profiles")
    .select("username, display_name, title, avatar_url, avatar_seed")
    .not("auth_id", "is", null);

  if (userProfile?.id) {
    peopleQuery = peopleQuery.neq("id", userProfile.id);
  }

  const { data: realUsers } = await peopleQuery
    .order("created_at", { ascending: false })
    .limit(3);

  const realPeople = (realUsers || []).map((u) => ({
    name: u.display_name,
    title: u.title || "Failbase member",
    username: u.username,
    avatarUrl: u.avatar_url || getAvatarUrl(u.avatar_seed || "default"),
  }));

  let peopleWhoGetIt = realPeople;
  if (peopleWhoGetIt.length < 3) {
    const seedFallback = SEED_PROFILES.filter(
      (sp) => !peopleWhoGetIt.find((p) => p.username === sp.username),
    )
      .slice(0, 3 - peopleWhoGetIt.length)
      .map((sp) => ({
        name: sp.display_name,
        title: sp.title,
        username: sp.username,
        avatarUrl: getAvatarUrl(sp.avatar_seed),
      }));
    peopleWhoGetIt = [...peopleWhoGetIt, ...seedFallback];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div
        className="card mb-6 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent} 100%)`,
        }}
      >
        <div className="px-6 py-4 relative flex items-center justify-between gap-4">
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{
              background: theme.highlight,
              transform: "translate(30%, -30%)",
            }}
          />
          <div className="relative z-10">
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1.5,
              }}
            >
              📉 The honest professional network.
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.5,
              }}
            >
              Real growth comes from real stories. Post yours.
            </p>
          </div>
          <Link
            href="/submit"
            className="shrink-0 px-4 py-2 rounded-full font-semibold text-sm text-white transition-all hover:opacity-90 hidden sm:block"
            style={{ background: theme.highlight }}
          >
            ✍️ Post Your Story
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_240px] gap-8 items-start">
        <aside className="hidden lg:flex flex-col gap-4 sticky top-[76px]">
          <CardProfile profile={userProfile} />
          <CardStatsWidget />
          <div className="card p-4">
            <h3
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: theme.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "12px",
              }}
            >
              People Who Get It
            </h3>
            <PeopleYouMayKnow people={peopleWhoGetIt} />
          </div>
        </aside>

        <section className="flex flex-col gap-4 min-w-0">
          <FeedSorter
            posts={allPosts}
            currentUserId={userProfile?.id || null}
          />
          <div className="card p-4 text-center">
            <button
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: theme.accent,
              }}
              className="hover:underline"
            >
              Load more stories ↓
            </button>
          </div>
        </section>

        <aside className="hidden lg:flex flex-col gap-4 sticky top-[76px]">
          <CardTrendingTopics />

          <div
            className="card p-4 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.dark}, ${theme.accent})`,
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "4px",
              }}
            >
              🌟 Story of the Week
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "white",
                marginBottom: "4px",
              }}
            >
              {storyOfWeek.name}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.65)",
                marginBottom: "10px",
                lineHeight: 1.5,
              }}
            >
              {storyOfWeek.snippet}
            </div>
            <Link
              href={storyOfWeek.href}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: theme.highlight,
              }}
              className="hover:underline"
            >
              Read the full story →
            </Link>
          </div>

          <div className="card p-4" style={{ borderStyle: "dashed" }}>
            <div
              style={{
                fontSize: "10px",
                color: theme.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "8px",
              }}
            >
              Sponsored
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: theme.dark,
                marginBottom: "4px",
              }}
            >
              🧘 Failure Coaching
            </div>
            <p
              style={{
                fontSize: "12px",
                color: theme.muted,
                marginBottom: "10px",
                lineHeight: 1.5,
              }}
            >
              Turn your story into your strategy. 12 weeks.{" "}
              <em>"I too was once employed."</em>
            </p>
            <button
              style={{
                width: "100%",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px",
                borderRadius: "99px",
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            >
              Learn More
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PeopleYouMayKnow({ people }) {
  return (
    <div className="flex flex-col gap-3">
      {people.map((person) => (
        <div key={person.username} className="flex items-center gap-2">
          <Link
            href={`/profile/${person.username}`}
            className="w-9 h-9 rounded-full overflow-hidden shrink-0"
          >
            <img
              src={person.avatarUrl}
              alt={person.name}
              className="w-full h-full object-cover"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${person.username}`}
              className="block truncate hover:underline"
              style={{ fontSize: "12px", fontWeight: 600, color: theme.dark }}
            >
              {person.name}
            </Link>
            <div
              style={{ fontSize: "11px", color: theme.muted }}
              className="truncate"
            >
              {person.title}
            </div>
          </div>
          <button
            style={{
              fontSize: "11px",
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              borderRadius: "99px",
              padding: "2px 10px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            + Follow
          </button>
        </div>
      ))}
    </div>
  );
}
