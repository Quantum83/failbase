"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAvatarUrl } from "@/lib/seed-data";
import { theme } from "@/lib/theme";

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setAvatarPreview(
          data.avatar_url || getAvatarUrl(data.avatar_seed || "default"),
        );
      }
      setAuthChecked(true);
    });
  }, [router]);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate: max 2MB, image only
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(userId) {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true });

    if (error) {
      console.error("Avatar upload error:", error.message);
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    // Add cache buster so browser shows new image
    return data.publicUrl + "?t=" + Date.now();
  }

  const canSubmit = displayName.trim() && title.trim();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !canSubmit) return;
    setIsLoading(true);

    const updates = {
      display_name: displayName.trim(),
      title: title.trim(),
    };

    if (location.trim()) updates.location = location.trim();
    if (about.trim()) updates.about = about.trim();

    // Upload avatar if one was selected
    const avatarUrl = await uploadAvatar(user.id);
    if (avatarUrl) updates.avatar_url = avatarUrl;

    await supabase.from("profiles").update(updates).eq("auth_id", user.id);

    router.push("/");
    router.refresh();
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
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: theme.bg }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">👋</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: theme.dark,
              marginBottom: "8px",
            }}
          >
            Set up your profile
          </h1>
          <p style={{ fontSize: "14px", color: theme.muted }}>
            Make it yours. The more honest, the better.
          </p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-lg cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={avatarPreview || getAvatarUrl("default")}
                  alt="Your avatar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    📷 Change
                  </span>
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
                Click to upload a photo (max 2MB)
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                placeholder="What should people call you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={60}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{
                  border: `1.5px solid ${theme.border}`,
                  color: theme.dark,
                }}
              />
            </div>

            {/* Headline */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Your Headline
              </label>
              <p
                style={{
                  fontSize: "11px",
                  color: theme.muted,
                  marginBottom: "8px",
                }}
              >
                The more creative, the better. Think LinkedIn, but honest.
              </p>
              <input
                type="text"
                placeholder='e.g. "4x Failed Founder | Currently Pivoting | Open to Anything"'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{
                  border: `1.5px solid ${theme.border}`,
                  color: theme.dark,
                }}
              />
              <p
                style={{
                  fontSize: "11px",
                  color: theme.muted,
                  marginTop: "4px",
                  textAlign: "right",
                }}
              >
                {120 - title.length} chars left
              </p>
            </div>

            {/* Location */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Location{" "}
                <span style={{ fontWeight: 400, textTransform: "none" }}>
                  (optional)
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. 'Remote (By Necessity)' or 'My Mom's Basement'"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={60}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{
                  border: `1.5px solid ${theme.border}`,
                  color: theme.dark,
                }}
              />
            </div>

            {/* About */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                About{" "}
                <span style={{ fontWeight: 400, textTransform: "none" }}>
                  (optional)
                </span>
              </label>
              <p
                style={{
                  fontSize: "11px",
                  color: theme.muted,
                  marginBottom: "8px",
                }}
              >
                A short bio. What went wrong? What are you learning?
              </p>
              <textarea
                placeholder="e.g. I've been professionally failing since 2019. Currently learning that 'move fast and break things' applies to my career too."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none resize-none"
                style={{
                  border: `1.5px solid ${theme.border}`,
                  color: theme.dark,
                  lineHeight: 1.6,
                }}
              />
              <p
                style={{
                  fontSize: "11px",
                  color: theme.muted,
                  marginTop: "4px",
                  textAlign: "right",
                }}
              >
                {300 - about.length} chars left
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !canSubmit}
              className="w-full py-3 rounded-full font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 mt-1"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
              }}
            >
              {isLoading ? "⏳ Setting up your profile..." : "Let's go 📉"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
