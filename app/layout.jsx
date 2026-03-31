import "./globals.css";
import LayoutNav from "@/components/layout/LayoutNav";
import LayoutFooter from "@/components/layout/LayoutFooter";
import LayoutBottomBar from "@/components/layout/LayoutBottomBar";
import { Fraunces, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import Script from "next/script";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://failbase.win"),
  title: {
    default: "Failbase | The Honest Professional Network",
    template: "%s | Failbase",
  },
  description:
    "The professional network where people post their failures instead of their wins. Celebrate vulnerability, share honestly, grow together.",
  keywords: [
    "failure",
    "professional network",
    "LinkedIn parody",
    "career failures",
    "honest networking",
    "vulnerability",
  ],
  openGraph: {
    type: "website",
    siteName: "Failbase",
    title: "Failbase | The Honest Professional Network",
    description:
      "The professional network where people post their failures instead of their wins.",
    url: "https://failbase.win",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Failbase | The Honest Professional Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Failbase | The Honest Professional Network",
    description:
      "The professional network where people post their failures instead of their wins.",
    images: ["/og-image.png"],
  },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${plusJakarta.variable} ${dmMono.variable} min-h-screen flex flex-col`}
        style={{ background: "#FBF5EC" }}
      >
        <LayoutNav />
        <main
          className="pt-[60px] pb-[72px] lg:pb-0 flex-1 flex flex-col"
          style={{ background: "#FBF5EC" }}
        >
          {children}
        </main>
        <LayoutFooter />
        <LayoutBottomBar />
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "d2f060ef193141c390ab5332d11ee017"}'
        />
      </body>
    </html>
  );
}
