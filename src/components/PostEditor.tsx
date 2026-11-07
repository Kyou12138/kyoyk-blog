import Link from "next/link";
import { deletePostAction, savePostAction, uploadAssetAction } from "@/app/admin/actions";
import { dateParts } from "@/lib/format";
import type { Post } from "@/lib/posts";

const toLocalInput = (iso: string | null): string => {
  if (!iso) return "";
  const { year, month, day } = dateParts(iso);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  return `${year}-${month}-${day}T${time}`;
};

const MESSAGES: Record<string, string> = {
  slug: "slug 只能是小写字母、数字和连字符。",
  "slug-taken": "这个 slug 已经被占用了。",
  title: "标题不能为空。",
  status: "状态不合法。",
  password: "私有笔记必须设置密码。",
  body: "私有笔记需要重新输入正文。",
  db: "写入数据库失败，请看服务端日志。",
  file: "没有选择文件。",
  "file-type": "只接受 8 MB 以内的图片。",
};

export default function PostEditor({
  post,
  notice,
  error,
  uploaded,
}: {
  post: Post | null;
  notice?: string;
  error?: string;
  uploaded?: string;
}) {
  const isPrivate = post?.status === "private";

  return (
    <div style={{ display: "grid", gap: "1.2rem" }}>
      {notice && <p className="notice">{notice}</p>}
      {error && MESSAGES[error] && <p className="error">{MESSAGES[error]}</p>}
      {uploaded && (
        <p className="notice">
          已上传，Markdown 里这样引用：<code>{`![](${uploaded})`}</code>
        </p>
      )}

      <form action={savePostAction}>
        {post && <input type="hidden" name="id" value={post.id} />}

        <div className="field">
          <label htmlFor="title">标题</label>
          <input id="title" name="title" defaultValue={post?.title ?? ""} required />
        </div>

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="field">
            <label htmlFor="slug">Slug（地址最后一段）</label>
            <input id="slug" name="slug" defaultValue={post?.slug ?? ""} placeholder="es16" required />
          </div>
          <div className="field">
            <label htmlFor="status">状态</label>
            <select id="status" name="status" defaultValue={post?.status ?? "draft"}>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="private">私有笔记（加密）</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="publishedAt">发布时间（东八区）</label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={toLocalInput(post?.publishedAt ?? null)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">摘要（列表和 SEO 用）</label>
          <input id="description" name="description" defaultValue={post?.description ?? ""} />
        </div>

        <div className="field">
          <label htmlFor="tags">标签（逗号分隔）</label>
          <input id="tags" name="tags" defaultValue={post?.tags.join(", ") ?? ""} placeholder="front-end, javascript" />
        </div>

        <div className="field">
          <label htmlFor="body">正文（Markdown）</label>
          <textarea
            id="body"
            name="body"
            defaultValue={post?.body ?? ""}
            placeholder={isPrivate ? "这篇是私有笔记，正文需要重新输入，保存时用下面的密码重新加密。" : "支持 Markdown 与 HTML"}
          />
        </div>

        <details className="panel" style={{ marginBottom: "1rem" }}>
          <summary style={{ cursor: "pointer" }}>私有笔记密码（仅状态为「私有笔记」时使用）</summary>
          <div className="field" style={{ marginTop: "0.8rem" }}>
            <label htmlFor="password">密码</label>
            <input id="password" name="password" type="password" autoComplete="new-password" />
          </div>
          <div className="field">
            <label htmlFor="hint">密码提示</label>
            <input id="hint" name="hint" defaultValue={post?.secret?.hint ?? ""} />
          </div>
        </details>

        <div className="admin-bar">
          <button className="button" type="submit">
            {post ? "保存" : "创建"}
          </button>
          {post && (
            <Link className="button button--ghost" href={`/blog/${post.slug}`}>
              查看
            </Link>
          )}
        </div>
      </form>

      {post && (
        <div className="admin-bar" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
          <form action={uploadAssetAction} encType="multipart/form-data">
            <input type="hidden" name="id" value={post.id} />
            <input type="file" name="file" accept="image/*" />
            <button className="button button--ghost" type="submit">
              上传图片
            </button>
          </form>

          <form action={deletePostAction} style={{ marginLeft: "auto" }}>
            <input type="hidden" name="id" value={post.id} />
            <button className="button button--ghost" type="submit">
              删除
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
