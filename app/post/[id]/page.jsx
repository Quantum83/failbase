import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import CardFailPost from "@/components/cards/CardFailPost";
import CommentInput from "@/components/ui/CommentInput";
import DeletePostButton from "@/components/ui/DeletePostButton";
import {
  SEED_POSTS,
  SEED_PROFILES,
  getAvatarUrl,
  formatNumber,
  getTotalReactions,
} from "@/lib/seed-data";
import { theme } from "@/lib/theme";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

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

export async function generateMetadata({ params }) {
  const supabase = createSupabaseServerClient();
  const { data: post } = await supabase
    .from("posts")
    .select("content, author_name")
    .eq("id", params.id)
    .single();

  if (post) {
    return {
      title: `${post.author_name} on Failbase`,
      description: post.content.slice(0, 120) + "...",
    };
  }

  const seedPost = SEED_POSTS.find((p) => p.id === params.id);
  if (seedPost) {
    const seedProfile = SEED_PROFILES.find((p) => p.id === seedPost.author_id);
    return {
      title: `${seedProfile?.display_name ?? "Someone"} on Failbase`,
      description: seedPost.content.slice(0, 120) + "...",
    };
  }

  return { title: "Post | Failbase" };
}

export default async function PostDetailPage({ params }) {
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

  const seedPost = SEED_POSTS.find((p) => p.id === params.id);
  const isSeedPost = !!seedPost;

  let post = null;
  let authorProfile = null;
  let comments = [];
  let reactionCounts = { yikes: 0, same: 0, skull: 0, understandable: 0 };
  let userReaction = null;
  let authorAchievements = [];

  if (isSeedPost) {
    post = { ...seedPost, userReaction: null };
    authorProfile = SEED_PROFILES.find((p) => p.id === seedPost.author_id);

    // Calculate seed author achievements
    const authorPosts = SEED_POSTS.filter(
      (p) => p.author_id === seedPost.author_id,
    );
    const totalReactions = authorPosts.reduce(
      (s, p) => s + getTotalReactions(p.reactions || {}),
      0,
    );
    const totalComments = authorPosts.reduce(
      (s, p) => s + (p.comments_count || 0),
      0,
    );
    const totalScore =
      authorPosts.length * 5 + totalReactions + totalComments * 3;
    authorAchievements = ACHIEVEMENTS.filter((a) =>
      a.condition(totalScore, authorPosts.length),
    ).map(({ emoji, label, description }) => ({ emoji, label, description }));
  } else {
    const { data: realPost } = await supabase
      .from("posts")
      .select(
        "*, profiles(id, username, display_name, title, avatar_url, avatar_seed, about, connections, created_at)",
      )
      .eq("id", params.id)
      .single();

    if (!realPost) notFound();

    post = {
      ...realPost,
      username: realPost.profiles?.username,
      avatar_url: realPost.profiles?.avatar_url || null,
      avatar_seed: realPost.profiles?.avatar_seed || null,
    };

    authorProfile = realPost.profiles;

    const { data: allReactions } = await supabase
      .from("reactions")
      .select("reaction_key, user_id")
      .eq("post_id", params.id);

    (allReactions || []).forEach((r) => {
      reactionCounts[r.reaction_key] =
        (reactionCounts[r.reaction_key] || 0) + 1;
    });

    if (userProfile) {
      const mine = (allReactions || []).find(
        (r) => r.user_id === userProfile.id,
      );
      userReaction = mine?.reaction_key || null;
    }

    post.reactions = reactionCounts;
    post.userReaction = userReaction;

    const { data: commentRows } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url, avatar_seed, display_name)")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true });

    comments = commentRows || [];
    post.comments_count = comments.length;

    // Calculate real author achievements
    if (authorProfile?.id) {
      const { data: authorPosts } = await supabase
        .from("posts")
        .select("id")
        .eq("author_id", authorProfile.id);

      const authorPostIds = (authorPosts || []).map((p) => p.id);
      let authorTotalReactions = 0;
      let authorTotalComments = 0;

      if (authorPostIds.length > 0) {
        const { count: rCount } = await supabase
          .from("reactions")
          .select("*", { count: "exact", head: true })
          .in("post_id", authorPostIds);
        authorTotalReactions = rCount || 0;

        const { count: cCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .in("post_id", authorPostIds);
        authorTotalComments = cCount || 0;
      }

      const authorScore =
        (authorPosts?.length || 0) * 5 +
        authorTotalReactions +
        authorTotalComments * 3;

      authorAchievements = ACHIEVEMENTS.filter((a) =>
        a.condition(authorScore, authorPosts?.length || 0),
      ).map(({ emoji, label, description }) => ({
        emoji,
        label,
        description,
      }));
    }
  }

  const isOwnPost =
    !isSeedPost && userProfile && post.author_id === userProfile.id;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <Link
          href="/"
          prefetch={true}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-80"
          style={{
            background: theme.sand,
            color: theme.dark,
            border: `1px solid ${theme.border}`,
          }}
        >
          ← Back to feed
        </Link>
        {isOwnPost && <DeletePostButton postId={post.id} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <CardFailPost
            post={post}
            currentUserId={userProfile?.id || null}
            hideComment={true}
          />

          <div className="card p-5">
            <h2
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: theme.dark,
                marginBottom: "16px",
              }}
            >
              {isSeedPost
                ? `${formatNumber(post.comments_count || 0)} Comments`
                : comments.length === 0
                  ? "No comments yet"
                  : `${comments.length} ${
                      comments.length === 1 ? "Comment" : "Comments"
                    }`}
            </h2>

            {!isSeedPost && (
              <CommentInput postId={post.id} userProfile={userProfile} />
            )}

            {isSeedPost ? (
              <SeedCommentPlaceholder count={post.comments_count} />
            ) : comments.length > 0 ? (
              <div className="flex flex-col gap-4 mt-6">
                {comments.map((comment) => (
                  <CommentRow key={comment.id} comment={comment} />
                ))}
              </div>
            ) : !userProfile ? (
              <p className="text-sm mt-4" style={{ color: theme.muted }}>
                <Link
                  href="/auth"
                  className="font-semibold hover:underline"
                  style={{ color: theme.accent }}
                >
                  Sign in
                </Link>{" "}
                to be the first to comment.
              </p>
            ) : null}
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[76px]">
          <AuthorSidebar
            profile={authorProfile}
            isSeedProfile={isSeedPost}
            achievements={authorAchievements}
          />
          <div className="card p-4 text-center">
            <p
              style={{
                fontSize: "13px",
                color: theme.muted,
                marginBottom: "10px",
                lineHeight: 1.5,
              }}
            >
              Want to share your own disaster?
            </p>
            <Link
              href="/submit"
              className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
              }}
            >
              ✍️ Post Your Story
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AuthorSidebar({ profile, isSeedProfile, achievements }) {
  if (!profile) return null;

  const avatarUrl = isSeedProfile
    ? getAvatarUrl(profile.avatar_seed)
    : profile.avatar_url ||
      (profile.avatar_seed
        ? getAvatarUrl(profile.avatar_seed)
        : `https://api.dicebear.com/8.x/notionists/svg?seed=default&backgroundColor=b6e3f4,c0aede`);

  const username = profile.username;
  const about =
    profile.about ||
    `"${profile.display_name} has learned from failure by failing repeatedly and with great enthusiasm."`;

  return (
    <div className="card overflow-hidden">
      <div
        className="h-12"
        style={{
          background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent} 100%)`,
        }}
      />

      <div className="px-4 pb-4">
        <div className="relative -mt-6 mb-3">
          <Link href={`/profile/${username}`}>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
              <img
                src={avatarUrl}
                alt={profile.display_name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>

        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "6px",
          }}
        >
          Posted by
        </div>

        <Link
          href={`/profile/${username}`}
          className="font-semibold hover:underline block"
          style={{ color: theme.dark, fontSize: "14px" }}
        >
          {profile.display_name}
        </Link>

        {profile.title && (
          <p
            className="mt-0.5"
            style={{
              fontSize: "12px",
              color: theme.muted,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            }}
          >
            {profile.title}
          </p>
        )}

        {profile.connections != null && (
          <p
            className="mt-1"
            style={{
              fontSize: "12px",
              color: theme.accent,
              fontWeight: 600,
            }}
          >
            {formatNumber(profile.connections)} connections
          </p>
        )}

        <div
          className="mt-3 pt-3"
          style={{ borderTop: `1px solid ${theme.sand}` }}
        >
          <p
            style={{
              fontSize: "12px",
              color: theme.muted,
              lineHeight: 1.6,
              fontStyle: profile.about ? "normal" : "italic",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
              whiteSpace: "pre-line",
            }}
          >
            {about}
          </p>
        </div>

        {achievements.length > 0 && (
          <div
            className="mt-3 pt-3"
            style={{ borderTop: `1px solid ${theme.sand}` }}
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
              Achievements
            </div>
            <div className="flex flex-wrap gap-1.5">
              {achievements.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    background: theme.accentLight,
                    color: theme.accent,
                    border: `1px solid ${theme.accent}44`,
                  }}
                >
                  {badge.emoji} {badge.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {isSeedProfile && (
          <div
            className="mt-3 px-3 py-2 rounded-lg"
            style={{
              background: theme.highlightLight,
              border: `1px solid ${theme.highlight}44`,
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: theme.highlight,
                lineHeight: 1.5,
              }}
            >
              🎭 This is a fictional profile created for demo purposes.
            </p>
          </div>
        )}

        <Link
          href={`/profile/${username}`}
          className="mt-3 block w-full text-center px-3 py-1.5 rounded-full text-xs font-semibold transition-colors hover:opacity-80"
          style={{
            border: `1.5px solid ${theme.accent}`,
            color: theme.accent,
          }}
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function CommentRow({ comment }) {
  const avatarUrl =
    comment.profiles?.avatar_url ||
    (comment.profiles?.avatar_seed
      ? getAvatarUrl(comment.profiles.avatar_seed)
      : `https://api.dicebear.com/8.x/notionists/svg?seed=${comment.author_name}&backgroundColor=b6e3f4,c0aede`);

  const username = comment.profiles?.username;
  const name =
    comment.profiles?.display_name || comment.author_name || "Someone";
  const timeAgo = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : "recently";

  return (
    <div
      className="flex gap-3 rounded-2xl px-4 py-3"
      style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
    >
      <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden mt-0.5">
        {username ? (
          <Link href={`/profile/${username}`}>
            <img
              src={avatarUrl}
              alt={name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </Link>
        ) : (
          <img
            src={avatarUrl}
            alt={name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          {username ? (
            <Link
              href={`/profile/${username}`}
              className="font-semibold text-sm hover:underline"
              style={{ color: theme.dark }}
            >
              {name}
            </Link>
          ) : (
            <span
              className="font-semibold text-sm"
              style={{ color: theme.dark }}
            >
              {name}
            </span>
          )}
          <span style={{ fontSize: "11px", color: theme.muted }}>
            {timeAgo}
          </span>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: theme.dark,
            lineHeight: 1.5,
            whiteSpace: "pre-line",
          }}
        >
          {comment.content}
        </p>
      </div>
    </div>
  );
}

function SeedCommentPlaceholder({ count }) {
  if (!count || count === 0) return null;
  return (
    <div
      className="mt-4 rounded-xl px-4 py-5 text-center"
      style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
    >
      <div className="text-2xl mb-2">💬</div>
      <p style={{ fontSize: "13px", fontWeight: 600, color: theme.dark }}>
        {formatNumber(count)} comments
      </p>
      <p
        className="mt-1"
        style={{ fontSize: "12px", color: theme.muted, lineHeight: 1.5 }}
      >
        This is a seed post. Comments live in the void.
      </p>
    </div>
  );
}
