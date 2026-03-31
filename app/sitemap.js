import { createSupabaseServerClient } from "../lib/supabase-server";

export default async function sitemap() {
  const supabase = createSupabaseServerClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, created_at");

  const staticPages = [
    {
      url: "https://failbase.win",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://failbase.win/explore",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://failbase.win/leaderboard",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: "https://failbase.win/search",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const postPages = (posts || []).map((post) => ({
    url: `https://failbase.win/post/${post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const profilePages = (profiles || []).map((profile) => ({
    url: `https://failbase.win/profile/${profile.username}`,
    lastModified: new Date(profile.created_at),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...postPages, ...profilePages];
}
