"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

const FAILURE_CATEGORIES = [
  { key: "startup", label: "💸 Startup Failure" },
  { key: "career", label: "💼 Career Implosion" },
  { key: "investment", label: "📉 Investment Disaster" },
  { key: "pitch", label: "🎤 Pitch Humiliation" },
  { key: "personal_brand", label: "🤡 Personal Brand Crisis" },
  { key: "other", label: "🌀 General Life Collapse" },
];

const PROMPTS = [
  "Excited to announce that...",
  "I want to be transparent with my network...",
  "Hot take: losing everything was the BEST thing...",
  "Normalizing failure. Here's mine:",
  "I need to be honest with my network...",
  "Plot twist:",
];

const MAX_CHARS = 1200;

export default function SubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", user.id)
        .single();
      setProfile(data);
      setAuthChecked(true);
    });
  }, [router]);

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit = content.length > 20 && !isOverLimit && !isSubmitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || !profile) return;
    setIsSubmitting(true);
    setError("");

    const { data: newPost, error: insertError } = await supabase
      .from("posts")
      .insert({
        author_id: profile.id,
        author_name: profile.display_name,
        author_title: profile.title,
        content,
        category: category || "other",
        is_featured: false,
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (insertError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    // Redirect to the new post
    router.push(`/post/${newPost.id}`);
  }

  if (!authChecked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.bg }}
      >
        <p style={{ color: theme.muted }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "4px",
          }}
        >
          Share with your network
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            fontWeight: 700,
            color: theme.dark,
          }}
        >
          Post Your Failure
        </h1>
        <p style={{ color: theme.muted, marginTop: "4px", fontSize: "14px" }}>
          Be the professional you were always too scared to be: honest.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Author preview */}
        <div
          className="card p-4 grid items-center gap-3 w-full"
          style={{ gridTemplateColumns: "44px 1fr" }}
        >
          <div className="w-11 h-11 rounded-full overflow-hidden">
            <img
              src={
                profile?.avatar_url ||
                `https://api.dicebear.com/8.x/notionists/svg?seed=${profile?.avatar_seed}&backgroundColor=b6e3f4`
              }
              alt={profile?.display_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div
              className="truncate"
              style={{ fontWeight: 600, color: theme.dark, fontSize: "14px" }}
            >
              {profile?.display_name}
            </div>
            <div
              className="truncate"
              style={{ fontSize: "12px", color: theme.muted }}
            >
              {profile?.title || "No headline yet"}
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="card p-5">
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: theme.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "12px",
            }}
          >
            Type of Failure
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FAILURE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={
                  category === cat.key
                    ? {
                        background: theme.accent,
                        color: "white",
                        border: `2px solid ${theme.accent}`,
                      }
                    : {
                        border: `2px solid ${theme.border}`,
                        color: theme.muted,
                      }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: theme.muted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Your Story
            </h2>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                color: isOverLimit ? theme.red : theme.muted,
                fontWeight: isOverLimit ? 700 : 400,
              }}
            >
              {charsLeft}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setContent(p + " ")}
                className="text-xs px-2.5 py-1 rounded-full transition-colors"
                style={{
                  background: theme.accentLight,
                  color: theme.accent,
                  border: `1px solid ${theme.accent}44`,
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell your story honestly. The more real, the more relatable."
            rows={10}
            className="w-full px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none rounded-lg transition-colors"
            style={{
              border: `1.5px solid ${isOverLimit ? theme.red : theme.border}`,
              color: theme.dark,
            }}
          />

          <div className="mt-2 flex items-center gap-2">
            {["📉", "💸", "😭", "🤡", "🚨"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setContent((c) => c + emoji)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: theme.red }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-full font-bold text-base text-white transition-all hover:opacity-90 disabled:opacity-40"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
          }}
        >
          {isSubmitting ? "⏳ Posting..." : "📉 Post This to the World"}
        </button>

        <p
          className="text-center"
          style={{ fontSize: "12px", color: theme.muted }}
        >
          Posts are public. Own your story.
        </p>
      </form>
    </div>
  );
}
