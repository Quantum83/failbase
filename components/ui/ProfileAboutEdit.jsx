"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function ProfileAboutEdit({
  currentAbout,
  displayName,
  authId,
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState(currentAbout);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await supabase
      .from("profiles")
      .update({ about: about.trim() })
      .eq("auth_id", authId);

    setIsSaving(false);
    setIsEditing(false);
    router.refresh();
  }

  function handleCancel() {
    setAbout(currentAbout);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="card p-4">
        <h3
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "8px",
          }}
        >
          About
        </h3>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          maxLength={300}
          rows={4}
          autoFocus
          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
          style={{
            border: `1.5px solid ${theme.accent}`,
            color: theme.dark,
            lineHeight: 1.6,
          }}
          placeholder="Tell people about yourself..."
        />
        <p
          style={{
            fontSize: "11px",
            color: theme.muted,
            textAlign: "right",
            marginTop: "2px",
            marginBottom: "8px",
          }}
        >
          {300 - about.length} chars left
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: theme.accent }}
          >
            {isSaving ? "..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${theme.border}`, color: theme.muted }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 group">
      <div className="flex items-center justify-between mb-2">
        <h3
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: theme.muted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          About
        </h3>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-0.5 rounded-full"
          style={{
            color: theme.accent,
            border: `1px solid ${theme.accent}44`,
            fontSize: "11px",
          }}
        >
          ✏️ Edit
        </button>
      </div>
      <p
        style={{
          fontSize: "12px",
          color: theme.muted,
          lineHeight: 1.6,
          fontStyle: currentAbout ? "normal" : "italic",
        }}
      >
        {currentAbout ||
          `"${displayName} has learned from failure by failing repeatedly and with great enthusiasm."`}
      </p>
    </div>
  );
}
