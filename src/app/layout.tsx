import type { Metadata } from "next";
import "highlight.js/styles/github-dark.css";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SearchPalette from "@/components/SearchPalette";
import SpotlightEffect from "@/components/SpotlightEffect";
import MagneticPull from "@/components/MagneticPull";
import TerminalHud from "@/components/TerminalHud";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

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
    <html lang="zh-Hans" data-theme="dark">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <SearchPalette />
        <SpotlightEffect />
        <MagneticPull />
        <TerminalHud />
      </body>
    </html>
  );
}
