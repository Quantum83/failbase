"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getAvatarUrl } from "@/lib/seed-data";
import { theme } from "@/lib/theme";

const tabs = [
  { href: "/", label: "Feed", icon: "📉" },
  { href: "/leaderboard", label: "Board", icon: "🏆" },
  { href: "/submit", label: "Post", isCenter: true },
  { href: "/explore", label: "Explore", icon: "🧭" },
];

export default function LayoutBottomBar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, avatar_seed")
        .eq("auth_id", session.user.id)
        .single();
      setProfile(data);
    }
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) {
        setProfile(null);
        return;
      }
      supabase
        .from("profiles")
        .select("username, display_name, avatar_url, avatar_seed")
        .eq("auth_id", session.user.id)
        .single()
        .then(({ data }) => setProfile(data));
    });
    return () => subscription.unsubscribe();
  }, []);

  const profileHref = profile ? `/profile/${profile.username}` : "/auth";
  const avatarUrl =
    profile?.avatar_url ||
    (profile?.avatar_seed ? getAvatarUrl(profile.avatar_seed) : null);

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white"
      style={{
        borderTop: `1px solid ${theme.border}`,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-end justify-around h-[60px]">
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center -mt-3"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg transition-transform active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
                  }}
                >
                  +
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    color: theme.muted,
                    marginTop: "2px",
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
            >
              <span
                className="text-lg leading-none"
                style={{ opacity: active ? 1 : 0.6 }}
              >
                {tab.icon}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: active ? 700 : 400,
                  color: active ? theme.accent : theme.muted,
                }}
              >
                {tab.label}
              </span>
              {active && (
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: theme.accent }}
                />
              )}
            </Link>
          );
        })}

        {/* Profile tab */}
        <Link
          href={profileHref}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
        >
          {avatarUrl ? (
            <div
              className="w-6 h-6 rounded-full overflow-hidden"
              style={{
                border: pathname.startsWith("/profile")
                  ? `2px solid ${theme.accent}`
                  : "2px solid transparent",
              }}
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <span
              className="text-lg leading-none"
              style={{ opacity: pathname.startsWith("/profile") ? 1 : 0.6 }}
            >
              👤
            </span>
          )}
          <span
            style={{
              fontSize: "10px",
              fontWeight: pathname.startsWith("/profile") ? 700 : 400,
              color: pathname.startsWith("/profile")
                ? theme.accent
                : theme.muted,
            }}
          >
            Profile
          </span>
          {pathname.startsWith("/profile") && (
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: theme.accent }}
            />
          )}
        </Link>
      </div>
    </nav>
  );
}
