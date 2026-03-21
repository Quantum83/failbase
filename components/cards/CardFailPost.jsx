"use client";
import Link from "next/link";
import { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  getProfile,
  getAvatarUrl,
  formatNumber,
  REACTIONS,
} from "@/lib/seed-data";
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

export default function CardFailPost({ post }) {
  const isSeedPost =
    !!post.author_id?.startsWith?.("seed-") ||
    (typeof post.reactions === "object" &&
      !Array.isArray(post.reactions) &&
      Object.keys(post.reactions || {}).length > 0 &&
      typeof Object.values(post.reactions || {})[0] === "number");

  const seedProfile = getProfile(post.author_id);
  const displayName =
    seedProfile?.display_name || post.author_name || "Anonymous";
  const displayTitle = seedProfile?.title || post.author_title || "";
  const profileUsername = seedProfile?.username || post.username || null;

  // Avatar priority: seed profile → post avatar_url → post avatar_seed → fallback
  const avatarUrl = seedProfile
    ? getAvatarUrl(seedProfile.avatar_seed)
    : post.avatar_url
      ? post.avatar_url
      : post.avatar_seed
        ? getAvatarUrl(post.avatar_seed)
        : `https://api.dicebear.com/8.x/notionists/svg?seed=${post.author_name || "default"}&backgroundColor=b6e3f4,c0aede`;

  const initialReactions =
    isSeedPost && post.reactions
      ? post.reactions
      : { yikes: 0, same: 0, skull: 0, understandable: 0 };

  const [reactionCounts] = useState(initialReactions);
  const [activeReaction, setActiveReaction] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverTimeout = useRef(null);
  const hideTimeout = useRef(null);

  const content = post.content || "";
  const isLong = content.length > 300;
  const displayContent =
    isLong && !isExpanded ? content.slice(0, 300) + "..." : content;
  const timeAgo = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : "recently";

  const totalReactions =
    Object.values(reactionCounts).reduce((s, v) => s + (v || 0), 0) +
    (activeReaction ? 1 : 0);

  function handleReact(key) {
    setActiveReaction((prev) => (prev === key ? null : key));
    setShowPopup(false);
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

  const { toast, showToast } = useToast();
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
              style={{ fontSize: "12px", color: theme.muted, marginTop: "2px" }}
            >
              {timeAgo} · 🌍
            </p>
          </div>
          <button
            className="shrink-0 p-1.5 rounded-full hover:bg-[#EFE9E3] transition-colors"
            style={{ color: theme.muted, fontSize: "18px", lineHeight: 1 }}
          >
            ···
          </button>
        </div>

        <div className="post-content mb-4">
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

        {totalReactions > 0 && (
          <div
            className="flex items-center justify-between pb-3 mb-1"
            style={{
              borderBottom: `1px solid ${theme.sand}`,
              fontSize: "13px",
              color: theme.muted,
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {REACTIONS.map((r) => {
                const count =
                  (reactionCounts[r.key] || 0) +
                  (activeReaction === r.key ? 1 : 0);
                if (count === 0) return null;
                return (
                  <span key={r.key} className="flex items-center gap-1">
                    <span>{r.emoji}</span>
                    <span>{formatNumber(count)}</span>
                  </span>
                );
              })}
            </div>
            <span style={{ whiteSpace: "nowrap", marginLeft: "8px" }}>
              {formatNumber(post.comments_count || 0)} comments
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 pt-1">
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
              className={`reaction-bar-btn ${activeReaction ? "reacted" : ""}`}
              onClick={() =>
                activeReaction
                  ? handleReact(activeReaction)
                  : handleReact("yikes")
              }
            >
              <span className="text-base">
                {currentReaction ? currentReaction.emoji : "😬"}
              </span>
              <span>{currentReaction ? currentReaction.label : "React"}</span>
            </button>
          </div>

          <button className="reaction-bar-btn">
            <span className="text-base">💬</span>
            <span>Comment</span>
          </button>

          <button className="reaction-bar-btn ml-auto" onClick={handleShare}>
            <span className="text-base">↗️</span>
            <span>Share</span>
          </button>
        </div>
      </div>
      <Toast toast={toast} />
    </article>
  );
}
