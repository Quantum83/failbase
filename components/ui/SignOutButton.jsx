"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { theme } from "@/lib/theme";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors hover:opacity-80"
      style={{
        color: theme.red,
        border: `1px solid ${theme.red}44`,
        background: `${theme.red}08`,
      }}
    >
      Sign Out
    </button>
  );
}
