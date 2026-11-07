import hljs from "highlight.js";
import MarkdownIt from "markdown-it";

export type HeadingItem = { level: 2 | 3; text: string; id: string };

// ponytail: html:true 是为了 31 篇旧文里的 <div>/<img>/<sup>；单作者写作，输入即本人。
// 若将来开放投稿，改成 html:false + rehype-sanitize。
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(code, { language }).value}</code></pre>`;
      } catch {
        /* 落到下面纯文本 */
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`;
  },
});

/** 中文标题做锚点：保留字母数字与中日韩字符，其余折叠成连字符。 */
const slugify = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "section";

type RenderEnv = { headings: HeadingItem[]; stack: string[] };

/** 给 h2/h3 生成 id，并在标题末尾挂一个可点击的锚点。 */
const headingAnchors = (instance: MarkdownIt): void => {
  instance.core.ruler.push("heading_anchors", (state) => {
    const env = state.env as RenderEnv;
    const used = new Map<string, number>();

    for (let i = 0; i < state.tokens.length; i += 1) {
      const open = state.tokens[i];
      if (open.type !== "heading_open" || (open.tag !== "h2" && open.tag !== "h3")) continue;

      const text = state.tokens[i + 1]?.content.trim() ?? "";
      const base = slugify(text);
      const seen = used.get(base) ?? 0;
      used.set(base, seen + 1);
      const id = seen === 0 ? base : `${base}-${seen + 1}`;

      open.attrSet("id", id);
      env.headings.push({ level: open.tag === "h2" ? 2 : 3, text, id });
    }
  });

  instance.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
    const id = tokens[idx - 2]?.attrGet("id");
    const close = `</${tokens[idx].tag}>\n`;
    if (!id) return close;
    return `<a class="heading-anchor" href="#${id}" aria-label="锚点">#</a>${close}`;
  };
};

headingAnchors(md);

/** 正文首行如果有和标题同名的 H1，去掉它，避免页面里出现两个一样的标题。 */
export const stripLeadingTitle = (source: string, title: string): string => {
  const match = source.match(/^\s*#\s+(.+?)\s*(?:\r?\n|$)/);
  if (!match) return source;
  const norm = (value: string): string => value.replace(/[\s\p{P}]/gu, "").toLowerCase();
  return norm(match[1]) === norm(title) ? source.slice(match[0].length) : source;
};

/** 渲染正文，同时返回标题树供右侧目录使用。 */
export const renderPost = (
  source: string,
  title?: string,
): { html: string; headings: HeadingItem[] } => {
  const env: RenderEnv = { headings: [], stack: [] };
  const html = md.render(title ? stripLeadingTitle(source, title) : source, env);
  return { html, headings: env.headings };
};

export const renderMarkdown = (source: string): string => md.render(source);

/** 去掉 Markdown 标记，取前 n 字作为摘要。 */
export const plainExcerpt = (source: string, length = 160): string => {
  const plain = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
};
