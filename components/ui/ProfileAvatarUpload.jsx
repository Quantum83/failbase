"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProfileAvatarUpload({ currentAvatarUrl, authId }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${authId}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Avatar upload error:", error.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl + "?t=" + Date.now();

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("auth_id", authId);

    router.refresh();
  }

  return (
    <div
      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg relative cursor-pointer group"
      onClick={() => fileInputRef.current?.click()}
    >
      <img
        src={currentAvatarUrl}
        alt="Your avatar"
        width={96}
        height={96}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-xs font-semibold">📷 Change</span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
