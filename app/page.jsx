import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import FeedSorter from "@/components/ui/FeedSorter";
import CardProfile from "@/components/cards/CardProfile";
import CardStatsWidget from "@/components/cards/CardStatsWidget";
import CardTrendingTopics from "@/components/cards/CardTrendingTopics";
import { SEED_POSTS } from "@/lib/seed-data";
import { theme } from "@/lib/theme";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Failbase — Where Professionals Come to Be Honest",
};

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

  const formattedRealPosts = (realPosts || []).map((p) => ({
    ...p,
    username: p.profiles?.username,
    avatar_url: p.profiles?.avatar_url || null,
    avatar_seed: p.profiles?.avatar_seed || null,
    reactions: null,
    comments_count: 0,
  }));

  const allPosts = [...formattedRealPosts, ...SEED_POSTS];

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
            <PeopleYouMayKnow />
          </div>
        </aside>

        <section className="flex flex-col gap-4 min-w-0">
          <FeedSorter posts={allPosts} />
          <div className="card p-4 text-center">
            <button
              style={{ fontSize: "14px", fontWeight: 600, color: theme.accent }}
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
              Kevin "Web5" Larsson
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.65)",
                marginBottom: "10px",
                lineHeight: 1.5,
              }}
            >
              Lost $400K in NFTs. Launched a Substack about it. Still in the
              Discord. Genuinely inspiring.
            </div>
            <Link
              href="/leaderboard"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: theme.highlight,
              }}
              className="hover:underline"
            >
              See full Shame Board →
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

function PeopleYouMayKnow() {
  const people = [
    { name: "Greg Hoffman", title: "NFT Artist (Retired)", seed: "Greg" },
    {
      name: "Stacey Bloom",
      title: "Life Coach (Self-Certified)",
      seed: "Stacey",
    },
    { name: "Marcus T.", title: "Founder of 0 Products", seed: "Marcus" },
  ];
  return (
    <div className="flex flex-col gap-3">
      {people.map((person) => (
        <div key={person.name} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
            <img
              src={`https://api.dicebear.com/8.x/notionists/svg?seed=${person.seed}&backgroundColor=b6e3f4,c0aede`}
              alt={person.name}
              className="w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div
              style={{ fontSize: "12px", fontWeight: 600, color: theme.dark }}
              className="truncate"
            >
              {person.name}
            </div>
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
