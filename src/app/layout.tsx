import type { Metadata } from "next";
import localFont from "next/font/local";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SearchPalette from "@/components/SearchPalette";
import MagneticPull from "@/components/MagneticPull";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import SpotlightEffect from "@/components/obsidian/SpotlightEffect";
import { getSkin } from "@/lib/skinPreference";
import { skinStylesheet } from "@/lib/skinCss";
import { SKIN_BOOT } from "@/lib/skins";

// ponytail: 只放拉丁 700 一个字重（22KB），中文与衬线走系统原生高品质字体栈
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
  icons: {
    icon: "/favicon.ico",
    apple: "/img/kyou.png",
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${SITE_URL}/rss.xml` },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "zh_CN",
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: [{ url: "/img/kyou-social-card.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: ["/img/kyou-social-card.png"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const skin = await getSkin();
  const ink = skin === "ink";
  return (
    <html lang="zh-Hans" data-skin={skin} className={bricolage.variable}>
      <head>
        <link rel="stylesheet" href={skinStylesheet(ink)} />
        <script dangerouslySetInnerHTML={{ __html: SKIN_BOOT }} />
      </head>
      <body>
        <SiteHeader skin={skin} />
        {children}
        <SiteFooter ink={ink} />
        <SearchPalette ink={ink} />
        {ink && <SpotlightEffect />}
        <MagneticPull ink={ink} />
      </body>
    </html>
  );
}
