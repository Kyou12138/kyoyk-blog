import hljs from "highlight.js";
import MarkdownIt from "markdown-it";

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
