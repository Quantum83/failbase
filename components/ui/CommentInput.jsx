"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAvatarUrl } from "@/lib/seed-data";
import { theme } from "@/lib/theme";

export default function CommentInput({ postId, userProfile }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const avatarUrl = userProfile
    ? userProfile.avatar_url ||
      (userProfile.avatar_seed
        ? getAvatarUrl(userProfile.avatar_seed)
        : `https://api.dicebear.com/8.x/notionists/svg?seed=default&backgroundColor=b6e3f4,c0aede`)
    : null;

  if (!userProfile) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: theme.accentLight,
          border: `1.5px solid ${theme.accent}44`,
          color: theme.muted,
        }}
      >
        <Link
          href="/auth"
          className="font-semibold hover:underline"
          style={{ color: theme.accent }}
        >
          Sign in
        </Link>{" "}
        to leave a comment.
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || trimmed.length < 2 || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    const { error: insertError } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: userProfile.id,
      author_name: userProfile.display_name,
      content: trimmed,
    });

    setIsSubmitting(false);

    if (insertError) {
      setError("Couldn't post comment. Try again.");
      return;
    }

    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-3 items-start">
        <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden mt-0.5">
          <img
            src={avatarUrl}
            alt={userProfile.display_name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            maxLength={500}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="w-full px-4 py-2.5 text-sm rounded-xl resize-none focus:outline-none transition-colors"
            style={{
              background: "white",
              border: `1.5px solid ${theme.border}`,
              color: theme.dark,
              lineHeight: 1.5,
            }}
          />
          <div className="flex items-center justify-between mt-1.5 px-1">
            {error ? (
              <span style={{ fontSize: "12px", color: theme.red }}>
                {error}
              </span>
            ) : (
              <span style={{ fontSize: "11px", color: theme.muted }}>
                {content.length > 0
                  ? `${500 - content.length} chars left · Enter to post`
                  : "Shift+Enter for new line"}
              </span>
            )}
            <button
              type="submit"
              disabled={content.trim().length < 2 || isSubmitting}
              className="px-4 py-1 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: theme.accent }}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
