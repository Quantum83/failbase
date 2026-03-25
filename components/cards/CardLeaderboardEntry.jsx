"use client";
import { useState } from "react";
import Link from "next/link";
import { getProfile, getAvatarUrl, formatNumber } from "@/lib/seed-data";
import { theme } from "@/lib/theme";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_LABELS = [
  "Grand Champion of Failure",
  "Distinguished Loser",
  "Certified Disaster",
];

export default function CardLeaderboardEntry({ user, rank }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSeed = user.id?.startsWith?.("seed-");

  let displayName;
  let username;
  let title;
  let avatarSrc;

  if (isSeed) {
    const seedProfile = getProfile(user.id);
    displayName = seedProfile?.display_name || "Unknown";
    username = seedProfile?.username;
    title = seedProfile?.title || "";
    avatarSrc = getAvatarUrl(seedProfile?.avatar_seed);
  } else {
    displayName = user.display_name || "Unknown";
    username = user.username || null;
    title = user.title || "";
    avatarSrc =
      user.avatar_url ||
      `https://api.dicebear.com/8.x/notionists/svg?seed=${user.avatar_seed || "default"}&backgroundColor=b6e3f4,c0aede`;
  }

  const profileHref = username ? `/profile/${username}` : "#";

  return (
    <div
      className={`card overflow-hidden ${
        rank === 1 ? "ring-1 ring-fail-gold/30" : ""
      }`}
      style={{
        border:
          rank === 1
            ? "2px solid #D4A017"
            : rank === 2
              ? "2px solid #9CA3AF"
              : rank === 3
                ? "2px solid #B45309"
                : `1px solid ${theme.border}`,
      }}
    >
      <div
        className="p-4 flex gap-4 items-center cursor-pointer transition-colors hover:bg-[#F9F8F6]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Rank */}
        <div className="shrink-0 text-center w-10">
          {rank <= 3 ? (
            <div className="text-2xl">{RANK_MEDALS[rank - 1]}</div>
          ) : (
            <div
              className="text-xl font-bold font-mono"
              style={{ color: theme.muted }}
            >
              #{rank}
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link
          href={profileHref}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img
              src={avatarSrc}
              alt={displayName}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link
              href={profileHref}
              className="font-semibold hover:underline text-sm"
              style={{ color: theme.dark }}
              onClick={(e) => e.stopPropagation()}
            >
              {displayName}
            </Link>
            {rank <= 3 && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: theme.highlight }}
              >
                {RANK_LABELS[rank - 1]}
              </span>
            )}
          </div>
          <p className="text-xs truncate mt-0.5" style={{ color: theme.muted }}>
            {title}
          </p>
        </div>

        {/* Score */}
        <div className="shrink-0 text-right flex items-center gap-3">
          <div>
            <div
              className="text-lg font-bold font-mono"
              style={{ color: theme.highlight }}
            >
              {formatNumber(user.totalScore)}
            </div>
            <div
              className="text-[10px] uppercase tracking-wide"
              style={{ color: theme.muted }}
            >
              shame pts
            </div>
          </div>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center transition-transform"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              color: theme.muted,
            }}
          >
            ▾
          </div>
        </div>
      </div>

      {/* Expanded breakdown */}
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-0"
          style={{ borderTop: `1px solid ${theme.border}` }}
        >
          <div className="pt-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span style={{ color: theme.muted }}>Posts (×5)</span>
              <span
                style={{
                  color: theme.dark,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {user.posts} × 5 = {user.posts * 5}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: theme.muted }}>Reactions</span>
              <span
                style={{
                  color: theme.dark,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {user.totalReactions}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: theme.muted }}>Comments (×3)</span>
              <span
                style={{
                  color: theme.dark,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {user.totalComments} × 3 = {user.totalComments * 3}
              </span>
            </div>
            <div
              className="flex justify-between text-xs"
              style={{
                borderTop: `1px solid ${theme.border}`,
                paddingTop: "6px",
                marginTop: "4px",
              }}
            >
              <span style={{ color: theme.muted, fontWeight: 600 }}>Total</span>
              <span
                style={{
                  fontWeight: 700,
                  color: theme.accent,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {formatNumber(user.totalScore)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
