import type { Metadata } from "next";
import "highlight.js/styles/github-dark.css";
import "./globals.css";
import localFont from "next/font/local";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SearchPalette from "@/components/SearchPalette";
import SpotlightEffect from "@/components/SpotlightEffect";
import MagneticPull from "@/components/MagneticPull";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

// ponytail: 只放拉丁 700 一个字重（22KB），中文继续用系统字体
const bricolage = localFont({
  src: "../fonts/bricolage-700.woff2",
  weight: "700",
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_TAGLINE,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${SITE_URL}/rss.xml` },
  },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "zh_CN" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans" data-theme="dark" className={bricolage.variable}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <SearchPalette />
        <SpotlightEffect />
        <MagneticPull />
      </body>
    </html>
  );
}
