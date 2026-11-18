import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colophon",
  description: "本站的工程选型、安全边界与排版体系。",
  alternates: { canonical: "/colophon" },
};

const stack = [
  {
    code: "01",
    title: "Next.js 15 Standalone",
    href: "https://nextjs.org/docs",
    why: "单机轻量容器化部署，借 App Router 与 Server Actions 实现零客户端胶水代码的原子写入，Standalone 镜像体积压至 60MB。",
  },
  {
    code: "02",
    title: "PostgreSQL 17 + 原生 SQL",
    href: "https://www.postgresql.org/docs/",
    why: "拒绝厚重 ORM。全站核心查询由参数化纯 SQL 驱动，配合连接池 SSL 握手缓存，执行计划清晰透明。",
  },
  {
    code: "03",
    title: "无用户表鉴权 (Scrypt + HMAC)",
    href: "https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback",
    why: "单作者架构无需多租户用户表。口令经 Scrypt 散列校验，会话由 HMAC-SHA256 签发 HttpOnly Cookie。",
  },
  {
    code: "04",
    title: "私有笔记封存 (AES-256-GCM)",
    href: "https://nodejs.org/api/crypto.html#class-aesgcm",
    why: "私有笔记入库前以服务端派生密钥加密为密文与认证标签，未登录请求一律返回 404，杜绝存在性侧信道。",
  },
  {
    code: "05",
    title: "Markdown-it + Highlight.js",
    href: "https://markdown-it.github.io/",
    why: "剔除运行期 MDX 复杂度。服务端一次性完成标题层级规整、中英锚点目录提取与代码块语法高亮。",
  },
  {
    code: "06",
    title: "原生 CSS 网格与 Canvas 拓扑",
    href: "https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API",
    why: "暖棉宣纸、松烟墨与朱砂构成的出版级排版网格；零外部图形库手写力导向知识拓扑与视口休眠调度。",
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
        <header className="editorial-head">
          <h1 className="editorial-head__title">Colophon</h1>
          <div className="editorial-head__aside">
            <span className="editorial-head__count">0{stack.length} 项</span>
          </div>
        </header>

        <div className="arch-grid">
          {stack.map((item) => (
            <article key={item.code} className="arch-card">
              <div className="arch-card__top">
                <span className="arch-card__code">{item.code}</span>
                <span className="arch-card__host">{hostOf(item.href)}</span>
              </div>

              <h2 className="arch-card__title">
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <span>{item.title}</span>
                  <span className="arch-card__arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </h2>

              <p className="arch-card__desc">{item.why}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
