export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth", "/onboarding"],
      },
    ],
    sitemap: "https://failbase.win/sitemap.xml",
  };
}
