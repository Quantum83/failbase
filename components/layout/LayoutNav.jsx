"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

// Explore intentionally NOT in this list — it lives in the bottom bar only
const navItems = [
  { href: "/", label: "Feed", icon: "📉" },
  { href: "/leaderboard", label: "Shame Board", icon: "🏆" },
];

export default function LayoutNav() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    }
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  useEffect(() => {
    setShowUserMenu(false);
  }, [pathname]);

  async function fetchProfile(authId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_id", authId)
      .single();
    setProfile(data);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    router.push("/");
    router.refresh();
  }

  const avatarUrl =
    profile?.avatar_url ||
    `https://api.dicebear.com/8.x/notionists/svg?seed=${
      profile?.avatar_seed || "default"
    }&backgroundColor=b6e3f4,c0aede`;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm"
      style={{ borderColor: theme.border }}
    >
      <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
            }}
          >
            f
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.2rem",
              color: theme.dark,
              letterSpacing: "-0.02em",
            }}
          >
            Failbase
          </span>
          <span
            className="hidden sm:inline-block"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: theme.accent,
              background: theme.accentLight,
              border: `1px solid ${theme.accent}`,
              padding: "1px 7px",
              borderRadius: "99px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            beta
          </span>
        </Link>

        {/* Search — desktop only */}
        <div className="hidden md:flex flex-1 max-w-xs">
          <div className="w-full relative">
            <input
              type="text"
              placeholder="Search failures..."
              readOnly
              className="w-full rounded-full px-4 py-1.5 text-sm focus:outline-none"
              style={{
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base">
              🔍
            </span>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
                style={{ color: isActive ? theme.accent : theme.muted }}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {user && (
            <div
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg"
              style={{ color: theme.muted }}
            >
              <span className="text-lg leading-none">🔔</span>
              <span style={{ fontSize: "11px" }}>Regrets</span>
              <span
                className="absolute top-0.5 right-1.5 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                style={{ background: theme.red }}
              >
                99
              </span>
            </div>
          )}

          {user ? (
            <div className="relative ml-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-full transition-colors hover:opacity-80"
                style={{ border: `1.5px solid ${theme.border}` }}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  <img
                    src={avatarUrl}
                    alt={profile?.display_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: theme.dark,
                    maxWidth: "80px",
                  }}
                  className="truncate hidden sm:block"
                >
                  {profile?.display_name?.split(" ")[0]}
                </span>
                <span style={{ fontSize: "10px", color: theme.muted }}>▾</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 card shadow-lg py-1 z-50">
                  {/* Name + email header */}
                  <div
                    className="px-4 py-2.5"
                    style={{ borderBottom: `1px solid ${theme.border}` }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: theme.dark,
                      }}
                      className="truncate"
                    >
                      {profile?.display_name}
                    </div>
                    <div
                      style={{ fontSize: "11px", color: theme.muted }}
                      className="truncate"
                    >
                      {user?.email}
                    </div>
                  </div>
                  <Link
                    href={`/profile/${profile?.username}`}
                    className="block px-4 py-2 text-sm hover:bg-[#F9F8F6] transition-colors"
                    style={{ color: theme.dark }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    👤 My Profile
                  </Link>
                  <Link
                    href="/submit"
                    className="block px-4 py-2 text-sm hover:bg-[#F9F8F6] transition-colors"
                    style={{ color: theme.dark }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    ✍️ Post a Failure
                  </Link>
                  <div
                    className="h-px my-1"
                    style={{ background: theme.border }}
                  />
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-[#F9F8F6] transition-colors"
                    style={{ color: theme.red }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
              }}
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile top bar — avatar or sign in only, bottom bar handles nav */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full overflow-hidden"
              style={{ border: `1.5px solid ${theme.border}` }}
            >
              <img
                src={avatarUrl}
                alt={profile?.display_name}
                className="w-full h-full object-cover"
              />
            </button>
          ) : (
            <Link
              href="/auth"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.highlight})`,
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile user menu dropdown */}
      {showUserMenu && (
        <div className="md:hidden absolute right-4 top-[60px] mt-1 w-56 card shadow-lg py-1 z-50">
          <div
            className="px-4 py-2.5"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <div
              style={{ fontSize: "13px", fontWeight: 600, color: theme.dark }}
              className="truncate"
            >
              {profile?.display_name}
            </div>
            <div
              style={{ fontSize: "11px", color: theme.muted }}
              className="truncate"
            >
              {user?.email}
            </div>
          </div>
          <Link
            href={`/profile/${profile?.username}`}
            className="block px-4 py-2 text-sm hover:bg-[#F9F8F6] transition-colors"
            style={{ color: theme.dark }}
            onClick={() => setShowUserMenu(false)}
          >
            👤 My Profile
          </Link>
          <Link
            href="/submit"
            className="block px-4 py-2 text-sm hover:bg-[#F9F8F6] transition-colors"
            style={{ color: theme.dark }}
            onClick={() => setShowUserMenu(false)}
          >
            ✍️ Post a Failure
          </Link>
          <div className="h-px my-1" style={{ background: theme.border }} />
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#F9F8F6] transition-colors"
            style={{ color: theme.red }}
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
