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
        { to: "/blog", label: "笔记", position: "left" },
        { to: "/proj", label: "项目", position: "left" },
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
