import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing_code`);
  }

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Auth callback error:", error?.message);
    return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
  }

  // Poll for profile — DB trigger creates it, but there's a brief race window
  let profile = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, title, username")
      .eq("auth_id", data.user.id)
      .single();

    if (existing) {
      profile = existing;
      break;
    }

    // Wait 500ms before retrying
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Fallback: if trigger didn't fire (or hasn't yet), create profile manually
  if (!profile) {
    const username =
      (data.user.email?.split("@")[0] || "user")
        .replace(/[^a-z0-9_]/gi, "_")
        .toLowerCase() +
      "_" +
      Math.random().toString(36).slice(2, 6);

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        auth_id: data.user.id,
        username,
        display_name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split("@")[0] ||
          "Anonymous",
        email: data.user.email,
        avatar_url: data.user.user_metadata?.avatar_url || null,
        avatar_seed: username,
        title: "",
      })
      .select("id, title, username")
      .single();

    if (insertError) {
      console.error("Profile creation fallback error:", insertError.message);
      // Profile might have been created by trigger between our last check and now
      const { data: retryProfile } = await supabase
        .from("profiles")
        .select("id, title, username")
        .eq("auth_id", data.user.id)
        .single();
      profile = retryProfile;
    } else {
      profile = newProfile;
    }
  }

  // No title → send to onboarding
  if (!profile?.title) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
