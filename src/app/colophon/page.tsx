import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "技术栈与系统架构",
  description: "个人站点的系统架构、工程选型与权衡决断。",
  alternates: { canonical: "/colophon" },
};

const stack = [
  {
    title: "Next.js 15 (App Router Standalone)",
    category: "CORE RUNTIME",
    badge: "v15.5",
    href: "https://nextjs.org/docs",
    why: "单机轻量全栈容器化，利用 App Router 与 Server Actions 实现零客户端胶水代码的原子保存，配合 Standalone 输出压缩镜像至 60MB。",
  },
  {
    title: "PostgreSQL 17 + 原生纯 SQL",
    category: "DATA PERSISTENCE",
    badge: "PG 17",
    href: "https://www.postgresql.org/docs/",
    why: "拒绝臃肿 ORM。全站仅 6 条核心高频查询，裸 SQL 配合连接池与 SSL 自动重试，执行计划一目了然，零无谓抽象层。",
  },
  {
    title: "无用户表轻量鉴权 (Scrypt + HMAC)",
    category: "SECURITY LAYER",
    badge: "Cookie Auth",
    href: "https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback",
    why: "单作者个人站架构，不需要冗余的多租户 Users 表。密码经 Scrypt (N=16384) 散列，会话由服务端 HMAC-SHA256 签名签发 HttpOnly Cookie。",
  },
  {
    title: "私有笔记封存：Scrypt + AES-256-GCM",
    category: "ZERO-KNOWLEDGE CIPHER",
    badge: "AES-GCM",
    href: "https://nodejs.org/api/crypto.html#class-aesgcm",
    why: "正文入库前客户端/服务端派生密钥加密封存，库中仅存密文与 Tag。服务端无明文泄露风险，解密密钥封入会话 Cookie 保障无感阅读。",
  },
  {
    title: "Markdown-it + Highlight.js 静态管线",
    category: "CONTENT PIPELINE",
    badge: "Deterministic",
    href: "https://markdown-it.github.io/",
    why: "剔除动态运行代码的 MDX 隐患。纯 Markdown 解析配合服务端语义降级（H1 规整、自动 TOC 提取、Mac 终端代码块高亮）。",
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
        <header className="section-block__head" style={{ marginBottom: "2.5rem" }}>
          <div className="section-block__meta">
            <span className="section-block__dot section-block__dot--gold" />
            <span className="section-block__tag">SYSTEM BLUEPRINT // COLOPHON</span>
          </div>
          <h1 className="section-block__title">全栈系统拓扑与架构决策</h1>
          <p className="section-block__desc">
            轻量单租户全栈站点的技术选型与工程权衡。不依赖庞大框架抽象，用最精简可信的代码解决问题。
          </p>
        </header>

        <div className="arch-grid">
          {stack.map((item) => (
            <article key={item.title} className="arch-card">
              <div className="arch-card__top">
                <span className="arch-card__category">{item.category}</span>
                <span className="arch-card__badge">{item.badge}</span>
              </div>

              <h2 className="arch-card__title">
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.title}
                  <span className="arch-card__arrow">↗</span>
                </a>
              </h2>

              <p className="arch-card__desc">{item.why}</p>

              <div className="arch-card__foot">
                <span className="arch-card__host">{hostOf(item.href)}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
