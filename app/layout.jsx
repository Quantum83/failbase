import "./globals.css";
import LayoutNav from "@/components/layout/LayoutNav";
import LayoutFooter from "@/components/layout/LayoutFooter";
import LayoutBottomBar from "@/components/layout/LayoutBottomBar";
import { Fraunces, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";

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
  title: "Failbase | The Professional Network for Failure",
  description:
    "Where the best professionals come to celebrate their worst moments. Post your failures. Earn your shame badge. Grow.",
  openGraph: {
    title: "Failbase | The Professional Network for Failure",
    description: "Post your failures. Earn your shame badge. Grow.",
    type: "website",
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
      </body>
    </html>
  );
}
