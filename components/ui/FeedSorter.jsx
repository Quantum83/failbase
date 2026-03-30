"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import CardFailPost from "@/components/cards/CardFailPost";
import { getTotalReactions, FAILURE_CATEGORIES } from "@/lib/seed-data";
import { theme } from "@/lib/theme";

const SORTS = [
  { key: "shameful", label: "🔥 Most Shameful" },
  { key: "recent", label: "🕐 Most Recent" },
  { key: "relatable", label: "😭 Most Relatable" },
];

const CATEGORY_OPTIONS = [
  { key: "all", label: "All Types" },
  ...FAILURE_CATEGORIES.map((c) => ({
    key: c.key,
    label: `${c.emoji} ${c.label}`,
  })),
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

function Dropdown({ value, options, onChange, alignRight = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeOption = options.find((o) => o.key === value);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full"
        style={{
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          color: theme.dark,
          minWidth: "120px",
        }}
      >
        <span className="truncate" style={{ fontSize: "12px" }}>
          {activeOption?.label}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: theme.muted,
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          ▼
        </span>
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 card shadow-lg py-1"
          style={{
            [alignRight ? "right" : "left"]: 0,
            minWidth: "180px",
            zIndex: 9990,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{
                color: value === opt.key ? theme.accent : theme.dark,
                fontWeight: value === opt.key ? 600 : 400,
                background:
                  value === opt.key ? theme.accentLight : "transparent",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeedSorter({ posts, currentUserId }) {
  const [activeSort, setActiveSort] = useState("shameful");
  const [activeCategory, setActiveCategory] = useState("all");

  const sorted = useMemo(() => {
    let realPosts = posts.filter((p) => !p.author_id?.startsWith?.("seed-"));
    let seedPosts = posts.filter((p) => p.author_id?.startsWith?.("seed-"));

    if (activeCategory !== "all") {
      realPosts = realPosts.filter(
        (p) => (p.category || "other") === activeCategory,
      );
      seedPosts = seedPosts.filter(
        (p) => (p.category || "other") === activeCategory,
      );
    }

    return [
      ...sortPosts(realPosts, activeSort),
      ...sortPosts(seedPosts, activeSort),
    ];
  }, [posts, activeSort, activeCategory]);

  return (
    <>
      <div
        className="card p-3"
        style={{ overflow: "visible", position: "relative", zIndex: 20 }}
      >
        {/* Desktop: sort pills left, filter dropdown right */}
        <div className="hidden sm:flex items-center gap-2 pr-2">
          <div className="flex gap-1.5 flex-1">
            {SORTS.map((sort) => (
              <button
                key={sort.key}
                onClick={() => setActiveSort(sort.key)}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap"
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
          <Dropdown
            value={activeCategory}
            options={CATEGORY_OPTIONS}
            onChange={setActiveCategory}
            alignRight
          />
        </div>

        {/* Mobile: two dropdowns side by side */}
        <div className="sm:hidden flex items-center gap-2">
          <div className="flex-1">
            <Dropdown
              value={activeSort}
              options={SORTS}
              onChange={setActiveSort}
            />
          </div>
          <div className="flex-1">
            <Dropdown
              value={activeCategory}
              options={CATEGORY_OPTIONS}
              onChange={setActiveCategory}
              alignRight
            />
          </div>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="card p-8 text-center">
          <p style={{ fontSize: "14px", color: theme.muted }}>
            No posts in this category yet. Be the first to share one.
          </p>
        </div>
      )}

      {sorted.map((post, i) => (
        <div key={post.id} className={`stagger-${Math.min(i + 1, 5)}`}>
          <CardFailPost post={post} currentUserId={currentUserId} />
        </div>
      ))}
    </>
  );
}
