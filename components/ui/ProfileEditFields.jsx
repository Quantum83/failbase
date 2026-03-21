"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function ProfileEditFields({
  currentName,
  currentTitle,
  currentLocation,
  currentAvatarUrl,
  authId,
}) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [title, setTitle] = useState(currentTitle);
  const [location, setLocation] = useState(currentLocation);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar() {
    if (!avatarFile) return null;
    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${authId}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true });

    if (error) {
      console.error("Avatar upload error:", error.message);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl + "?t=" + Date.now();
  }

  async function handleSave() {
    setIsSaving(true);

    const updates = {
      display_name: name.trim(),
      title: title.trim(),
      location: location.trim(),
    };

    const avatarUrl = await uploadAvatar();
    if (avatarUrl) updates.avatar_url = avatarUrl;

    await supabase.from("profiles").update(updates).eq("auth_id", authId);

    setIsSaving(false);
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    router.refresh();
  }

  function handleCancel() {
    setName(currentName);
    setTitle(currentTitle);
    setLocation(currentLocation);
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 mt-1">
        <div className="flex items-center gap-3">
          <div
            className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow cursor-pointer group shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={avatarPreview || currentAvatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">📷</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <p style={{ fontSize: "11px", color: theme.muted }}>
            Click photo to change (max 2MB)
          </p>
        </div>

        <div>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: theme.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ border: `1.5px solid ${theme.accent}`, color: theme.dark }}
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: theme.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Headline
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ border: `1.5px solid ${theme.accent}`, color: theme.dark }}
            placeholder='e.g. "4x Failed Founder | Still Trying"'
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: theme.muted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={60}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ border: `1.5px solid ${theme.accent}`, color: theme.dark }}
            placeholder='e.g. "Remote (By Necessity)"'
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: theme.accent }}
          >
            {isSaving ? "⏳ Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${theme.border}`, color: theme.muted }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center gap-2">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: theme.dark,
          }}
        >
          {currentName}
        </h1>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2.5 py-1 rounded-full"
          style={{
            color: theme.accent,
            border: `1px solid ${theme.accent}44`,
            fontSize: "11px",
          }}
        >
          ✏️ Edit Profile
        </button>
      </div>
      <p style={{ fontSize: "13px", color: theme.muted, marginTop: "2px" }}>
        {currentTitle || <em>No headline yet — hover to edit!</em>}
      </p>
    </div>
  );
}
