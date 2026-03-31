import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CardStatsWidget from "@/components/cards/CardStatsWidget";
import CardTrendingTopics from "@/components/cards/CardTrendingTopics";
import PeopleSection from "@/components/ui/PeopleSection";
import {
  SEED_POSTS,
  SEED_PROFILES,
  getProfile,
  getAvatarUrl,
  getDateSeeded,
  QUOTES,
  FAKE_ADS,
} from "@/lib/seed-data";
import { theme } from "@/lib/theme";
import SearchInput from "@/components/ui/SearchInput";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore",
  description:
    "Discover the latest professional failures, trending topics, and people who get it on Failbase.",
};

function getSnippet(content, maxLen = 120) {
  if (!content) return "";
  const clean = content.replace(/\n+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).trim() + "...";
}

export default async function ExplorePage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", user.id)
      .single();
    userProfile = data;
  }

  // Trending post — same logic as feed
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("id, content, author_name, created_at")
    .gte("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  let storyOfWeek;
  const recentIds = (recentPosts || []).map((p) => p.id);

  if (recentIds.length > 0) {
    const { data: recentReactions } = await supabase
      .from("reactions")
      .select("post_id")
      .in("post_id", recentIds);

    const countsByPost = {};
    (recentReactions || []).forEach((r) => {
      countsByPost[r.post_id] = (countsByPost[r.post_id] || 0) + 1;
    });

    let bestPost = null;
    let bestCount = 0;
    (recentPosts || []).forEach((p) => {
      const total = countsByPost[p.id] || 0;
      if (total > bestCount) {
        bestCount = total;
        bestPost = p;
      }
    });

    if (bestPost && bestCount >= 1) {
      storyOfWeek = {
        name: bestPost.author_name,
        snippet: getSnippet(bestPost.content),
        href: `/post/${bestPost.id}`,
      };
    }
  }

  // Seed fallback
  if (!storyOfWeek) {
    const seedPick = getDateSeeded(SEED_POSTS, 1, 5)[0];
    const seedAuthor = getProfile(seedPick.author_id);
    storyOfWeek = {
      name: seedAuthor?.display_name || "Anonymous",
      snippet: getSnippet(seedPick.content),
      href: `/post/${seedPick.id}`,
    };
  }

  // People Who Get It
  let peopleQuery = supabase
    .from("profiles")
    .select("username, display_name, title, avatar_url, avatar_seed")
    .not("auth_id", "is", null);

  if (userProfile?.id) {
    peopleQuery = peopleQuery.neq("id", userProfile.id);
  }

  const { data: realUsers } = await peopleQuery
    .order("created_at", { ascending: false })
    .limit(15);

  const realPeople = (realUsers || []).map((u) => ({
    name: u.display_name,
    title: u.title || "Failbase member",
    username: u.username,
    avatarUrl: u.avatar_url || getAvatarUrl(u.avatar_seed || "default"),
  }));

  let allPeople = realPeople;
  if (allPeople.length < 10) {
    const seedFallback = SEED_PROFILES.filter(
      (sp) => !allPeople.find((p) => p.username === sp.username),
    )
      .slice(0, 10 - allPeople.length)
      .map((sp) => ({
        name: sp.display_name,
        title: sp.title,
        username: sp.username,
        avatarUrl: getAvatarUrl(sp.avatar_seed),
      }));
    allPeople = [...allPeople, ...seedFallback];
  }

  const todayQuote = getDateSeeded(QUOTES, 1, 2)[0];
  const todayAd = getDateSeeded(FAKE_ADS, 1, 7)[0];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <h1
        className="mb-6"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "1.5rem",
          color: theme.dark,
        }}
      >
        🧭 Explore
      </h1>

      {/* Search Failbase */}
      <div className="mb-6">
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "8px",
          }}
        >
          🔍 Search Failbase
        </div>
        <SearchInput
          compact
          placeholder="Search posts, people, or regrets..."
        />
      </div>

      {/* Story of the Week hero */}
      <div
        className="card mb-6 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.dark}, ${theme.accent})`,
        }}
      >
        <div className="p-5">
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            🌟 Story of the Week
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "white",
              marginBottom: "6px",
            }}
          >
            {storyOfWeek.name}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.65)",
              marginBottom: "14px",
              lineHeight: 1.6,
              wordBreak: "break-word",
            }}
          >
            {storyOfWeek.snippet}
          </div>
          <Link
            href={storyOfWeek.href}
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: theme.highlight, color: "white" }}
          >
            Read the full story →
          </Link>
        </div>
      </div>

      {/* Daily Quote */}
      <div
        className="card mb-6 p-5"
        style={{ borderLeft: `4px solid ${theme.highlight}` }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "8px",
          }}
        >
          💬 Daily Wisdom
        </div>
        <p
          style={{
            fontSize: "15px",
            fontStyle: "italic",
            color: theme.dark,
            lineHeight: 1.6,
            marginBottom: "8px",
            wordBreak: "break-word",
          }}
        >
          &ldquo;{todayQuote.text}&rdquo;
        </p>
        <p style={{ fontSize: "12px", color: theme.muted }}>
          {todayQuote.author}
        </p>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <CardStatsWidget />
        <CardTrendingTopics />
      </div>

      {/* 
      People Who Get It 
      */}
      <div className="card p-5 mb-6">
        <h3
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "16px",
          }}
        >
          People Who Get It
        </h3>
        <PeopleSection people={allPeople} initialCount={5} />
      </div>

      {/* Daily rotating fake ad */}
      <div className="card p-5" style={{ borderStyle: "dashed" }}>
        <div
          style={{
            fontSize: "10px",
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "10px",
          }}
        >
          Sponsored
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: theme.dark,
            marginBottom: "6px",
          }}
        >
          {todayAd.emoji} {todayAd.title}
        </div>
        <p
          style={{
            fontSize: "13px",
            color: theme.muted,
            marginBottom: "14px",
            lineHeight: 1.6,
            wordBreak: "break-word",
          }}
        >
          {todayAd.body}
        </p>
        <button
          style={{
            width: "100%",
            fontSize: "13px",
            fontWeight: 600,
            padding: "8px",
            borderRadius: "99px",
            border: `1px solid ${theme.border}`,
            color: theme.muted,
          }}
        >
          {todayAd.cta}
        </button>
      </div>
    </div>
  );
}
