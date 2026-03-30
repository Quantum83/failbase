import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { theme } from "@/lib/theme";
import SearchInput from "@/components/ui/SearchInput";
import CardSearchPerson from "@/components/cards/CardSearchPerson";
import FeedSorter from "@/components/ui/FeedSorter";

export const dynamic = "force-dynamic";

export function generateMetadata({ searchParams }) {
  const q = searchParams.q;
  if (q) return { title: `"${q}" | Search | Failbase` };
  return { title: "Search | Failbase" };
}

const PER_PAGE = 20;

const ACHIEVEMENTS = [
  { condition: (s) => s.postCount >= 1 },
  { condition: (s) => s.postCount >= 5 },
  { condition: (s) => s.postCount >= 10 },
  { condition: (s) => s.reactionCount >= 10 },
  { condition: (s) => s.reactionCount >= 50 },
  { condition: (s) => s.commentCount >= 3 },
  { condition: (s) => s.shameScore >= 100 },
];

function countAchievements(stats) {
  return ACHIEVEMENTS.filter((a) => a.condition(stats)).length;
}

function escapeLike(str) {
  return str.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export default async function SearchPage({ searchParams }) {
  const q = searchParams.q || "";
  const tab = searchParams.tab || "posts";
  const page = parseInt(searchParams.page || "1", 10);
  const offset = (page - 1) * PER_PAGE;

  const supabase = createSupabaseServerClient();

  // Current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let currentUserId = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", user.id)
      .single();
    currentUserId = profile?.id || null;
  }

  let posts = [];
  let people = [];
  let hasNextPage = false;
  const hasQuery = q.trim().length > 0;

  if (hasQuery) {
    const escaped = escapeLike(q.trim());

    if (tab === "people") {
      // ── People search ──
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .or(
          `display_name.ilike.%${escaped}%,username.ilike.%${escaped}%,title.ilike.%${escaped}%`,
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + PER_PAGE - 1);

      const matched = profiles || [];
      hasNextPage = matched.length === PER_PAGE;

      if (matched.length > 0) {
        const profileIds = matched.map((p) => p.id);

        // Posts by these authors
        const { data: authorPosts } = await supabase
          .from("posts")
          .select("id, author_id")
          .in("author_id", profileIds);

        const postCountMap = {};
        (authorPosts || []).forEach((p) => {
          postCountMap[p.author_id] = (postCountMap[p.author_id] || 0) + 1;
        });

        // Reactions received on their posts
        const authorPostIds = (authorPosts || []).map((p) => p.id);
        const reactionCountMap = {};
        if (authorPostIds.length > 0) {
          const { data: reactions } = await supabase
            .from("reactions")
            .select("post_id")
            .in("post_id", authorPostIds);

          const postToAuthor = {};
          (authorPosts || []).forEach((p) => {
            postToAuthor[p.id] = p.author_id;
          });
          (reactions || []).forEach((r) => {
            const aid = postToAuthor[r.post_id];
            if (aid) reactionCountMap[aid] = (reactionCountMap[aid] || 0) + 1;
          });
        }

        // Comments made by these authors
        const { data: authorComments } = await supabase
          .from("comments")
          .select("author_id")
          .in("author_id", profileIds);

        const commentCountMap = {};
        (authorComments || []).forEach((c) => {
          commentCountMap[c.author_id] =
            (commentCountMap[c.author_id] || 0) + 1;
        });

        people = matched.map((p) => {
          const postCount = postCountMap[p.id] || 0;
          const reactionCount = reactionCountMap[p.id] || 0;
          const commentCount = commentCountMap[p.id] || 0;
          const shameScore = postCount * 5 + reactionCount + commentCount * 3;
          const achievementCount = countAchievements({
            postCount,
            reactionCount,
            commentCount,
            shameScore,
          });
          return {
            profile: p,
            stats: { postCount, achievementCount },
          };
        });
      }
    } else {
      // ── Posts search ──
      const { data: matchedPosts } = await supabase
        .from("posts")
        .select("*")
        .or(`content.ilike.%${escaped}%,author_name.ilike.%${escaped}%`)
        .order("created_at", { ascending: false })
        .range(offset, offset + PER_PAGE - 1);

      const rawPosts = matchedPosts || [];
      hasNextPage = rawPosts.length === PER_PAGE;

      if (rawPosts.length > 0) {
        const postIds = rawPosts.map((p) => p.id);
        const authorIds = [...new Set(rawPosts.map((p) => p.author_id))];

        // Author profiles for avatars + usernames
        const { data: authors } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, avatar_seed")
          .in("id", authorIds);

        const authorMap = {};
        (authors || []).forEach((a) => {
          authorMap[a.id] = a;
        });

        // Reactions per post
        const { data: reactions } = await supabase
          .from("reactions")
          .select("post_id, reaction_key")
          .in("post_id", postIds);

        const reactionsByPost = {};
        (reactions || []).forEach((r) => {
          if (!reactionsByPost[r.post_id]) reactionsByPost[r.post_id] = {};
          reactionsByPost[r.post_id][r.reaction_key] =
            (reactionsByPost[r.post_id][r.reaction_key] || 0) + 1;
        });

        // Comments per post
        const { data: comments } = await supabase
          .from("comments")
          .select("id, post_id, author_id, author_name, content, created_at")
          .in("post_id", postIds)
          .order("created_at", { ascending: true });

        const commentsByPost = {};
        (comments || []).forEach((c) => {
          if (!commentsByPost[c.post_id]) commentsByPost[c.post_id] = [];
          commentsByPost[c.post_id].push(c);
        });

        // Comment author profiles for avatars
        const commentAuthorIds = [
          ...new Set((comments || []).map((c) => c.author_id)),
        ];
        const commentAuthorMap = {};
        if (commentAuthorIds.length > 0) {
          const { data: commentAuthors } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, avatar_seed")
            .in("id", commentAuthorIds);
          (commentAuthors || []).forEach((a) => {
            commentAuthorMap[a.id] = a;
          });
        }

        posts = rawPosts.map((p) => {
          const author = authorMap[p.author_id] || {};
          const postComments = (commentsByPost[p.id] || []).map((c) => {
            const ca = commentAuthorMap[c.author_id] || {};
            return {
              ...c,
              author_username: ca.username,
              author_avatar_url: ca.avatar_url,
              author_avatar_seed: ca.avatar_seed,
            };
          });

          return {
            ...p,
            author_username: author.username,
            author_avatar_url: author.avatar_url,
            author_avatar_seed: author.avatar_seed,
            reactions: reactionsByPost[p.id] || {},
            comments: postComments.slice(0, 3),
            comments_count: postComments.length,
          };
        });
      }
    }
  }

  function buildUrl(params) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.tab && params.tab !== "posts") sp.set("tab", params.tab);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    return `/search?${sp.toString()}`;
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Search input */}
      <div className="mb-6">
        <SearchInput
          key={q}
          defaultValue={q}
          autoFocus={!hasQuery}
          placeholder="Search posts, people, or regrets..."
        />
      </div>

      {hasQuery ? (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <Link
              href={buildUrl({ q, tab: "posts" })}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                tab !== "people"
                  ? { background: theme.accent, color: "white" }
                  : { color: theme.muted, background: theme.sand }
              }
            >
              📝 Posts
            </Link>
            <Link
              href={buildUrl({ q, tab: "people" })}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                tab === "people"
                  ? { background: theme.accent, color: "white" }
                  : { color: theme.muted, background: theme.sand }
              }
            >
              👥 People
            </Link>
          </div>

          {/* Results */}
          {tab === "people" ? (
            people.length > 0 ? (
              <div className="flex flex-col gap-3">
                {people.map(({ profile, stats }) => (
                  <CardSearchPerson
                    key={profile.id}
                    profile={profile}
                    stats={stats}
                  />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>👤</div>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: theme.dark,
                    marginBottom: "4px",
                  }}
                >
                  No one goes by &ldquo;{q}&rdquo;
                </p>
                <p style={{ fontSize: "13px", color: theme.muted }}>Yet.</p>
              </div>
            )
          ) : posts.length > 0 ? (
            <div className="flex flex-col gap-3">
              <FeedSorter posts={posts} currentUserId={currentUserId} />
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: theme.dark,
                  marginBottom: "4px",
                }}
              >
                No posts found for &ldquo;{q}&rdquo;
              </p>
              <p style={{ fontSize: "13px", color: theme.muted }}>
                Maybe that failure hasn&apos;t been posted yet.
              </p>
            </div>
          )}

          {/* Pagination */}
          {(page > 1 || hasNextPage) && (
            <div className="flex items-center justify-center gap-3 mt-6">
              {page > 1 && (
                <Link
                  href={buildUrl({ q, tab, page: page - 1 })}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    border: `1px solid ${theme.border}`,
                    color: theme.dark,
                  }}
                >
                  ← Previous
                </Link>
              )}
              <span style={{ fontSize: "13px", color: theme.muted }}>
                Page {page}
              </span>
              {hasNextPage && (
                <Link
                  href={buildUrl({ q, tab, page: page + 1 })}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    border: `1px solid ${theme.border}`,
                    color: theme.dark,
                  }}
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        /* Empty state — no query yet */
        <div className="card p-8 text-center">
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
          <p
            style={{
              fontSize: "17px",
              fontWeight: 600,
              color: theme.dark,
              marginBottom: "6px",
            }}
          >
            What are you looking for?
          </p>
          <p
            style={{
              fontSize: "14px",
              color: theme.muted,
              lineHeight: 1.6,
            }}
          >
            Search posts, people, or regrets. Everyone&apos;s got something to
            share.
          </p>
        </div>
      )}
    </div>
  );
}
