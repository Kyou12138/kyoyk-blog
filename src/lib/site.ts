export const SITE_URL = (process.env.SITE_URL ?? "https://kythron.com").replace(/\/$/, "");
export const SITE_NAME = "Kyou Blog";
export const SITE_AUTHOR = "Kyou";
export const SITE_TAGLINE = "持续学习，拥抱变化。";

export const NAV = [
  { href: "/blog", label: "笔记", inkLabel: "笔记" },
  { href: "/proj", label: "工具", inkLabel: "资源&工具" },
  { href: "/colophon", label: "Colophon", inkLabel: "技术栈" },
  { href: "/about", label: "关于", inkLabel: "关于" },
] as const;
