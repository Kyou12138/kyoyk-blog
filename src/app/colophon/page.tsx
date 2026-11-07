import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "技术栈",
  description: "这个站点用了什么，以及为什么。",
  alternates: { canonical: "/colophon" },
};

const stack = [
  {
    title: "Next.js 15（App Router）",
    category: "框架",
    href: "https://nextjs.org/docs",
    why: "内容是数据库里的，不是构建时的文件，所以需要服务端渲染 + 服务端动作。App Router 的 Server Actions 让「保存文章」这件事不需要手写 API。",
  },
  {
    title: "PostgreSQL + 裸 SQL",
    category: "数据",
    href: "https://www.postgresql.org/docs/",
    why: "文章、标签、修订、上传的图片都在库里。没有用 ORM：查询只有五六条，SQL 比映射层短，而且 explain 的时候能直接看到执行计划。",
  },
  {
    title: "自建鉴权",
    category: "安全",
    href: "https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback",
    why: "一个作者，不需要用户表。密码用 scrypt 存哈希，会话是 HMAC 签名的 HttpOnly cookie，没有引入 NextAuth 这类为多租户设计的库。",
  },
  {
    title: "私有笔记：scrypt + AES-256-GCM",
    category: "安全",
    href: "https://nodejs.org/api/crypto.html#class-aesgcm",
    why: "正文在入库前用密码派生的密钥加密，密钥只在解锁时算出来，再封进 cookie。服务端从不保存明文，密码错时 GCM 校验直接失败。",
  },
  {
    title: "markdown-it + highlight.js",
    category: "渲染",
    href: "https://markdown-it.github.io/",
    why: "写作是 Markdown。没有上 MDX：在线写作让编辑器能执行代码，收益远小于风险。",
  },
  {
    title: "华为云 ECS + Cloudflare Tunnel",
    category: "部署",
    href: "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/",
    why: "一台 2 GB 的机器，docker compose 跑应用、数据库和隧道。构建不在机器上做，由 GitHub Actions 构建镜像推到 SWR。没有开放任何入站端口，流量全部经 Cloudflare。",
  },
];

const hostOf = (href: string): string => {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
};

export default function ColophonPage() {
  return (
    <main className="section">
      <div className="container">
        <h1 style={{ fontSize: "1.7rem", marginTop: 0 }}>技术栈</h1>
        <p className="muted" style={{ maxWidth: "60ch" }}>
          这个站点本身是项目的一部分。下面每一项都记了选择它的理由，以及被放弃的替代方案。
        </p>
        <ul className="stack-grid">
          {stack.map((item) => (
            <li key={item.title} className="post-card stack-card">
              <div className="post-card__meta">
                <span className="tag tag--active">{item.category}</span>
                <a
                  className="stack-card__link"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {hostOf(item.href)} ↗
                </a>
              </div>
              <h3>{item.title}</h3>
              <p>{item.why}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
