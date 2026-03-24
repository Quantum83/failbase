"use client";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  getProfile,
  getAvatarUrl,
  formatNumber,
  REACTIONS,
} from "@/lib/seed-data";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";
import { useToast, Toast } from "@/components/ui/Toast";

function ReactionPopup({ onReact, activeReaction }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: "100%",
          left: 0,
          width: "200px",
          height: "16px",
        }}
      />
      <div className="reaction-popup">
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            className="reaction-popup-btn"
            style={{
              background:
                activeReaction === r.key ? theme.accentLight : "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onReact(r.key);
            }}
          >
            <span>{r.emoji}</span>
            <span className="tooltip">{r.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function InlineCommentInput({ postId, currentUserId, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!currentUserId) {
    return (
      <div className="pt-3">
        <p style={{ fontSize: "13px", color: theme.muted }}>
          <Link
            href="/auth"
            className="font-semibold hover:underline"
            style={{ color: theme.accent }}
          >
            Sign in
          </Link>{" "}
          to leave a comment.
        </p>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || trimmed.length < 2 || isSubmitting) return;

    setIsSubmitting(true);

    // Get current user's profile for display
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, avatar_seed, username")
      .eq("id", currentUserId)
      .single();

    const { data: newComment, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: currentUserId,
        author_name: profile?.display_name || "You",
        content: trimmed,
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (error) return;

    // Add to local state with profile info
    onCommentAdded({
      ...newComment,
      profiles: profile
        ? {
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url,
            avatar_seed: profile.avatar_seed,
          }
        : null,
    });
    setContent("");
  }

  return (
    <form onSubmit={handleSubmit} className="pt-3">
      <div className="flex gap-2.5 items-center">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className="flex-1 px-4 py-2 text-sm rounded-full focus:outline-none transition-colors"
          style={{
            background: "white",
            border: `1.5px solid ${theme.border}`,
            color: theme.dark,
          }}
        />
        <button
          type="submit"
          disabled={content.trim().length < 2 || isSubmitting}
          className="px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
          style={{ background: theme.accent }}
        >
          {isSubmitting ? "..." : "Post"}
        </button>
      </div>
    </form>
  );
}

function InlineComment({ comment }) {
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
    : "just now";

  return (
    <div className="flex gap-2.5">
      <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden mt-0.5">
        {username ? (
          <Link href={`/profile/${username}`}>
            <img
              src={avatarUrl}
              alt={name}
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </Link>
        ) : (
          <img
            src={avatarUrl}
            alt={name}
            width={28}
            height={28}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div
        className="flex-1 min-w-0 rounded-xl px-3 py-2"
        style={{
          background: theme.bg,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-baseline gap-2 flex-wrap">
          {username ? (
            <Link
              href={`/profile/${username}`}
              className="font-semibold hover:underline"
              style={{ color: theme.dark, fontSize: "12px" }}
            >
              {name}
            </Link>
          ) : (
            <span
              className="font-semibold"
              style={{ color: theme.dark, fontSize: "12px" }}
            >
              {name}
            </span>
          )}
          <span style={{ fontSize: "10px", color: theme.muted }}>
            {timeAgo}
          </span>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: theme.dark,
            lineHeight: 1.5,
            marginTop: "2px",
            whiteSpace: "pre-line",
          }}
        >
          {comment.content}
        </p>
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-2.5 animate-pulse">
      <div
        className="w-7 h-7 rounded-full shrink-0"
        style={{ background: theme.sand }}
      />
      <div className="flex-1">
        <div
          className="h-3 rounded w-24 mb-2"
          style={{ background: theme.sand }}
        />
        <div
          className="h-3 rounded w-full"
          style={{ background: theme.sand }}
        />
      </div>
    </div>
  );
}

export default function CardFailPost({
  post,
  currentUserId,
  hideComment = false,
}) {
  const router = useRouter();
  const { toast, showToast } = useToast();

  const isSeedPost = !!post.author_id?.startsWith?.("seed-");

  const seedProfile = getProfile(post.author_id);
  const displayName =
    seedProfile?.display_name || post.author_name || "Anonymous";
  const displayTitle = seedProfile?.title || post.author_title || "";
  const profileUsername = seedProfile?.username || post.username || null;

  const avatarUrl = seedProfile
    ? getAvatarUrl(seedProfile.avatar_seed)
    : post.avatar_url
      ? post.avatar_url
      : post.avatar_seed
        ? getAvatarUrl(post.avatar_seed)
        : `https://api.dicebear.com/8.x/notionists/svg?seed=${post.author_name || "default"}&backgroundColor=b6e3f4,c0aede`;

  const initialReactions = post.reactions || {
    yikes: 0,
    same: 0,
    skull: 0,
    understandable: 0,
  };

  const [reactionCounts, setReactionCounts] = useState({ ...initialReactions });
  const [activeReaction, setActiveReaction] = useState(
    post.userReaction || null,
  );
  const [showPopup, setShowPopup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const hoverTimeout = useRef(null);
  const hideTimeout = useRef(null);

  // Inline comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(
    post.comments_count || 0,
  );

  const content = post.content || "";
  const isLong = content.length > 300;
  const displayContent =
    isLong && !isExpanded ? content.slice(0, 300) + "..." : content;
  const timeAgo = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : "recently";

  const totalReactions = Object.values(reactionCounts).reduce(
    (s, v) => s + (v || 0),
    0,
  );

  async function handleReact(key) {
    if (isSeedPost) {
      const prev = activeReaction;
      if (prev === key) {
        setActiveReaction(null);
        setReactionCounts((c) => ({
          ...c,
          [key]: Math.max(0, (c[key] || 0) - 1),
        }));
      } else {
        setActiveReaction(key);
        setReactionCounts((c) => {
          const updated = { ...c, [key]: (c[key] || 0) + 1 };
          if (prev) updated[prev] = Math.max(0, (c[prev] || 0) - 1);
          return updated;
        });
      }
      setShowPopup(false);
      return;
    }

    if (!currentUserId) {
      router.push("/auth");
      return;
    }

    if (isReacting) return;
    setIsReacting(true);
    setShowPopup(false);

    const prevReaction = activeReaction;
    const prevCounts = { ...reactionCounts };

    if (activeReaction === key) {
      setActiveReaction(null);
      setReactionCounts((c) => ({
        ...c,
        [key]: Math.max(0, (c[key] || 0) - 1),
      }));

      const { error } = await supabase
        .from("reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);

      if (error) {
        setActiveReaction(prevReaction);
        setReactionCounts(prevCounts);
        showToast("Something went wrong", "❌");
      }
    } else {
      setActiveReaction(key);
      setReactionCounts((c) => {
        const updated = { ...c, [key]: (c[key] || 0) + 1 };
        if (prevReaction)
          updated[prevReaction] = Math.max(0, (c[prevReaction] || 0) - 1);
        return updated;
      });

      const { error } = await supabase
        .from("reactions")
        .upsert(
          { post_id: post.id, user_id: currentUserId, reaction_key: key },
          { onConflict: "post_id,user_id" },
        );

      if (error) {
        setActiveReaction(prevReaction);
        setReactionCounts(prevCounts);
        showToast("Something went wrong", "❌");
      }
    }

    setIsReacting(false);
  }

  async function handleToggleComments() {
    if (isSeedPost) {
      setShowComments((prev) => !prev);
      return;
    }

    if (!commentsLoaded) {
      setShowComments(true);
      setLoadingComments(true);

      const { data } = await supabase
        .from("comments")
        .select("*, profiles(username, avatar_url, avatar_seed, display_name)")
        .eq("post_id", post.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setComments((data || []).reverse());
      setCommentsLoaded(true);
      setLoadingComments(false);
    } else {
      setShowComments((prev) => !prev);
    }
  }

  function handleCommentAdded(newComment) {
    setComments((prev) => [...prev, newComment]);
    setLocalCommentCount((c) => c + 1);
  }

  function handleMouseEnter() {
    clearTimeout(hideTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowPopup(true), 300);
  }

  function handleMouseLeave() {
    clearTimeout(hoverTimeout.current);
    hideTimeout.current = setTimeout(() => setShowPopup(false), 200);
  }

  function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link copied to clipboard", "🔗");
    });
  }

  const currentReaction = activeReaction
    ? REACTIONS.find((r) => r.key === activeReaction)
    : null;

  return (
    <article className="card animate-slide-up overflow-hidden">
      {post.is_featured && (
        <div
          className="px-5 py-2 flex items-center gap-2"
          style={{
            background: theme.highlightLight,
            borderBottom: `1px solid ${theme.highlight}44`,
          }}
        >
          <span className="text-sm">🔥</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: theme.highlight,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Trending Right Now
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Author row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
            {profileUsername ? (
              <Link href={`/profile/${profileUsername}`}>
                <img
                  src={avatarUrl}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </Link>
            ) : (
              <img
                src={avatarUrl}
                alt={displayName}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {profileUsername ? (
              <Link
                href={`/profile/${profileUsername}`}
                className="font-semibold hover:underline"
                style={{ color: theme.dark, fontSize: "15px" }}
              >
                {displayName}
              </Link>
            ) : (
              <span
                className="font-semibold"
                style={{ color: theme.dark, fontSize: "15px" }}
              >
                {displayName}
              </span>
            )}
            <p
              className="line-clamp-1 mt-0.5"
              style={{ fontSize: "12px", color: theme.muted }}
            >
              {displayTitle}
            </p>
            <p
              style={{
                fontSize: "12px",
                color: theme.muted,
                marginTop: "2px",
              }}
            >
              {timeAgo} · 🌍
            </p>
          </div>
        </div>

        {/* Content with separator */}
        <div className="mb-4">
          <div className="post-content px-1">
            {displayContent}
            {isLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="font-semibold ml-1 hover:underline"
                style={{ color: theme.accent, fontSize: "14px" }}
              >
                {isExpanded ? "see less" : "see more"}
              </button>
            )}
          </div>
          <div
            style={{
              borderBottom: `1px solid ${theme.border}`,
              marginTop: "14px",
            }}
          />
        </div>

        {/* Stats row */}
        {(totalReactions > 0 || localCommentCount > 0) && (
          <div
            className="flex items-center justify-between pb-3 mb-1"
            style={{
              fontSize: "13px",
              color: theme.muted,
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {totalReactions > 0 &&
                REACTIONS.map((r) => {
                  const count = reactionCounts[r.key] || 0;
                  if (count === 0) return null;
                  return (
                    <span key={r.key} className="flex items-center gap-1">
                      <span>{r.emoji}</span>
                      <span>{formatNumber(count)}</span>
                    </span>
                  );
                })}
            </div>
            {localCommentCount > 0 && (
              <button
                onClick={handleToggleComments}
                className="hover:underline"
                style={{
                  whiteSpace: "nowrap",
                  marginLeft: "8px",
                  color: theme.muted,
                  fontSize: "13px",
                }}
              >
                {formatNumber(localCommentCount)} comments
              </button>
            )}
          </div>
        )}

        {/* Action bar */}
        <div
          style={{
            borderTop: `1px solid ${theme.sand}`,
            marginBottom: "4px",
          }}
        />
        <div className="flex items-center gap-1 pt-1">
          {/* React */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {showPopup && (
              <ReactionPopup
                onReact={handleReact}
                activeReaction={activeReaction}
              />
            )}
            <button
              className="reaction-bar-btn"
              onClick={() =>
                activeReaction
                  ? handleReact(activeReaction)
                  : handleReact("yikes")
              }
              style={
                activeReaction
                  ? {
                      color: theme.accent,
                      fontWeight: 700,
                      background: theme.accentLight,
                      borderRadius: "8px",
                    }
                  : {}
              }
            >
              <span className="text-base">
                {currentReaction ? currentReaction.emoji : "😬"}
              </span>
              <span>{currentReaction ? currentReaction.label : "React"}</span>
            </button>
          </div>

          {/* Comment toggle */}
          {!hideComment && (
            <button
              className="reaction-bar-btn"
              onClick={handleToggleComments}
              style={
                showComments
                  ? {
                      color: theme.accent,
                      fontWeight: 600,
                      background: theme.accentLight,
                      borderRadius: "8px",
                    }
                  : {}
              }
            >
              <span className="text-base">💬</span>
              <span>Comment</span>
            </button>
          )}

          {/* Right group */}
          <div className="flex items-center gap-1 ml-auto">
            {!hideComment && (
              <Link
                href={`/post/${post.id}`}
                prefetch={true}
                className="reaction-bar-btn"
                style={{ textDecoration: "none" }}
              >
                <span className="text-base">📄</span>
                <span>View</span>
              </Link>
            )}
            <button className="reaction-bar-btn" onClick={handleShare}>
              <span className="text-base">↗️</span>
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Inline comments section */}
        {showComments && !hideComment && (
          <div
            className="mt-3 pt-3"
            style={{ borderTop: `1px solid ${theme.sand}` }}
          >
            {isSeedPost ? (
              <div className="text-center py-3">
                <p
                  style={{
                    fontSize: "12px",
                    color: theme.muted,
                    lineHeight: 1.5,
                  }}
                >
                  💬 {formatNumber(post.comments_count || 0)} comments on this
                  seed post.
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    color: theme.muted,
                    marginTop: "2px",
                  }}
                >
                  These live in the void.
                </p>
              </div>
            ) : (
              <>
                {loadingComments ? (
                  <div className="flex flex-col gap-3">
                    <CommentSkeleton />
                    <CommentSkeleton />
                  </div>
                ) : (
                  <>
                    {comments.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {comments.map((c) => (
                          <InlineComment key={c.id} comment={c} />
                        ))}
                      </div>
                    )}

                    {localCommentCount > 3 && (
                      <Link
                        href={`/post/${post.id}`}
                        className="block text-center mt-3 text-xs font-semibold hover:underline"
                        style={{ color: theme.accent }}
                      >
                        View all {formatNumber(localCommentCount)} comments →
                      </Link>
                    )}
                  </>
                )}

                <InlineCommentInput
                  postId={post.id}
                  currentUserId={currentUserId}
                  onCommentAdded={handleCommentAdded}
                />
              </>
            )}
          </div>
        )}
      </div>

      {typeof document !== "undefined" &&
        createPortal(<Toast toast={toast} />, document.body)}
    </article>
  );
}
