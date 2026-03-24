"use client";
import { useState, useMemo } from "react";
import CardFailPost from "@/components/cards/CardFailPost";
import { getTotalReactions } from "@/lib/seed-data";
import { theme } from "@/lib/theme";

const SORTS = [
  { key: "shameful", label: "🔥 Most Shameful" },
  { key: "recent", label: "🕐 Most Recent" },
  { key: "relatable", label: "😭 Most Relatable" },
];

function sortPosts(posts, activeSort) {
  const copy = [...posts];
  if (activeSort === "shameful") {
    return copy.sort((a, b) => {
      const scoreA =
        getTotalReactions(a.reactions) + (a.comments_count || 0) * 3;
      const scoreB =
        getTotalReactions(b.reactions) + (b.comments_count || 0) * 3;
      return scoreB - scoreA;
    });
  }
  if (activeSort === "recent") {
    return copy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (activeSort === "relatable") {
    return copy.sort((a, b) => {
      const relA =
        (a.reactions?.same || 0) + (a.reactions?.understandable || 0);
      const relB =
        (b.reactions?.same || 0) + (b.reactions?.understandable || 0);
      return relB - relA;
    });
  }
  return copy;
}

export default function FeedSorter({ posts, currentUserId }) {
  const [activeSort, setActiveSort] = useState("shameful");

  const sorted = useMemo(() => {
    const realPosts = posts.filter((p) => !p.author_id?.startsWith?.("seed-"));
    const seedPosts = posts.filter((p) => p.author_id?.startsWith?.("seed-"));

    return [
      ...sortPosts(realPosts, activeSort),
      ...sortPosts(seedPosts, activeSort),
    ];
  }, [posts, activeSort]);

  return (
    <>
      <div className="card p-3 flex items-center gap-2 flex-wrap">
        <span style={{ fontSize: "12px", color: theme.muted, fontWeight: 500 }}>
          Sort by:
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {SORTS.map((sort) => (
            <button
              key={sort.key}
              onClick={() => setActiveSort(sort.key)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
              style={
                activeSort === sort.key
                  ? { background: theme.accent, color: "white" }
                  : { color: theme.muted, background: "transparent" }
              }
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.map((post, i) => (
        <div key={post.id} className={`stagger-${Math.min(i + 1, 5)}`}>
          <CardFailPost post={post} currentUserId={currentUserId} />
        </div>
      ))}
    </>
  );
}
