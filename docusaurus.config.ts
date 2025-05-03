import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Kyoyk Blog",
  tagline: "持续学习，拥抱变化。",
  favicon: "img/kyou.ico",

  // Set the production url of your site here
  url: "https://blog.kyoyk.top",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "kyou12138", // Usually your GitHub org/user name.
  projectName: "kyoyk-blog", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/kyou12138/kyoyk-blog/",
        },
        blog: {
          blogSidebarTitle: "笔记列表",
          blogSidebarCount: "ALL",
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/kyou12138/kyoyk-blog/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    algolia: {
      // The application ID provided by Algolia
      appId: "DOQQO6NJUR",

      // Public API key: it is safe to commit it
      apiKey: "1c34cabc141c7228db257f268b87a13d",

      indexName: "kyoyk",

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
      externalUrlRegex: "external\\.com|domain\\.com",

      // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
      replaceSearchResultPathname: {
        from: "/docs/", // or as RegExp: /\/docs\//
        to: "/",
      },
    },
    // Replace with your project's social card
    image: "img/kyou-social-card.jpg",
    colorMode: {
      defaultMode: "dark",
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: "Kyoyk Blog",
      logo: {
        alt: "Kyoyk Blog Logo",
        src: "img/logo.svg",
      },
      items: [
        // {
        //   type: "docSidebar",
        //   sidebarId: "tutorialSidebar",
        //   position: "left",
        //   label: "Tutorial",
        // },
        {
          activeBaseRegex: "^/blog$",
          to: "/blog",
          label: "笔记",
          position: "left",
        },
        {
          type: "dropdown",
          label: "分类",
          position: "left",
          items: [
            { to: "/blog/tags", label: "全部分类" },
            { to: "/blog/tags/ai", label: "AI" },
            { to: "/blog/tags/front-end", label: "前端" },
            { to: "/blog/tags/back-end", label: "后端" },
            { to: "/blog/tags/other", label: "其他" },
          ],
        },
        { to: "/proj", label: "资源&工具", position: "left" },
        {
          href: "https://github.com/kyou12138/kyoyk-blog",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      // logo: {
      //   alt: "Kyou Fairy tail Logo",
      //   src: "img/kyou.ico",
      //   href: "/",
      //   width: 25,
      //   height: 25,
      // },
      links: [
        {
          title: "Links",
          items: [
            {
              label: "🤖 AI 笔记本",
              href: "https://ai-note-git-main-kyou12138s-projects.vercel.app/",
            },
            {
              label: "💼 关于 Kyou",
              href: "https://kyou12138.github.io/",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/kyou12138/kyoyk-blog",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Kyoyk Blog, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
