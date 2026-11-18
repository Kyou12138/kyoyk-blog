"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deletePostAction, savePostAction } from "@/app/admin/actions";
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
  db: "保存失败，请重试。输入已保留。",
  date: "请输入有效的发布时间。",
  file: "没有选择文件。",
  "file-type": "只接受 8 MB 以内的图片。",
  unauthorized: "登录已过期，请重新登录。",
};

export default function PostEditor({
  post,
  initialHtml = "",
  notice,
}: {
  post: Pick<Post, "id" | "slug" | "title" | "body" | "status" | "tags" | "description" | "publishedAt"> | null;
  initialHtml?: string;
  notice?: string;
}) {
  const [body, setBody] = useState(post?.body ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const router = useRouter();
  const [preview, setPreview] = useState(initialHtml);
  const [previewError, setPreviewError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const unchanged = body === (post?.body ?? "") && title === (post?.title ?? "");
  const [status, setStatus] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const insert = useCallback((snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setBody((current) => `${current}${snippet}`);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    setBody((current) => `${current.slice(0, start)}${snippet}${current.slice(end)}`);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + snippet.length;
      el.setSelectionRange(caret, caret);
    });
  }, []);

  const upload = useCallback(
    async (file: File) => {
      setStatus("正在上传图片…");
      const data = new FormData();
      data.append("file", file);
      try {
        const response = await fetch("/api/admin/upload", { method: "POST", body: data });
        const payload = await response.json() as { url?: string; error?: string };
        if (!response.ok || !payload.url) {
          setStatus(MESSAGES[payload.error ?? ""] ?? "上传失败，请重试。");
          return;
        }
        insert(`![](${payload.url})\n`);
        setStatus("图片已插入正文。");
      } catch {
        setStatus("上传失败，请检查连接后重试。");
      }
    },
    [insert],
  );

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(event.clipboardData.files).find((item) => item.type.startsWith("image/"));
    if (!file) return;
    event.preventDefault();
    void upload(file);
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void upload(file);
    event.target.value = "";
  };

  useEffect(() => {
    setPreviewError("");
    if (unchanged) {
      setPreview(initialHtml);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ markdown: body, title }),
          signal: controller.signal,
        });
        if (response.status === 401) { setPreviewError(MESSAGES.unauthorized); return; }
        if (!response.ok) throw new Error();
        const { html } = await response.json() as { html: string };
        if (!controller.signal.aborted) setPreview(html);
      } catch {
        if (!controller.signal.aborted) setPreviewError("预览更新失败，保留上次预览。");
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [body, title, unchanged, initialHtml]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const result = await savePostAction(new FormData(event.currentTarget));
      if ("error" in result) setSaveError(MESSAGES[result.error] ?? MESSAGES.db);
      else {
        router.replace(`/admin/posts/${result.id}?saved=1`);
        router.refresh();
      }
    } catch {
      setSaveError("未能确认保存结果，请检查连接。输入已保留。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="editor-studio">
      {notice && <p className="notice">{notice}</p>}
      {saveError && <p className="error" role="alert">{saveError}</p>}
      {status && <p className="notice" role="status">{status}</p>}
      {[saveError, status, previewError].includes(MESSAGES.unauthorized) && (
        <a href="/admin/login" target="_blank" rel="noopener noreferrer">在新标签页登录</a>
      )}

      <form id="post-editor-form" onSubmit={save} className="editor-form">
        {post && <input type="hidden" name="id" value={post.id} />}

        <div className="field editor-title-field">
          <label htmlFor="title">标题</label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="输入笔记标题…"
            required
          />
        </div>

        <div className="editor-meta-grid">
          <div className="field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" defaultValue={post?.slug ?? ""} placeholder="es16" required />
          </div>
          <div className="field">
            <label htmlFor="status">状态</label>
            <select id="status" name="status" defaultValue={post?.status ?? "draft"}>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="private">私有笔记</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="publishedAt">发布时间</label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              defaultValue={toLocalInput(post?.publishedAt ?? null)}
            />
          </div>
          <div className="field">
            <label htmlFor="tags">标签</label>
            <input
              id="tags"
              name="tags"
              defaultValue={post?.tags.join(", ") ?? ""}
              placeholder="front-end, javascript"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">摘要</label>
          <input
            id="description"
            name="description"
            defaultValue={post?.description ?? ""}
            placeholder="可选"
          />
        </div>

        <div className="editor">
          <div className="editor__pane">
            <div className="editor__bar">
              <label htmlFor="body">Markdown · {body.length} 字</label>
              <button
                className="button button--ghost button--sm"
                type="button"
                onClick={() => fileRef.current?.click()}
              >
                插入图片
              </button>
              <input
                ref={fileRef}
                type="file"
                aria-label="选择图片"
                tabIndex={-1}
                accept="image/*"
                onChange={handleFile}
                className="sr-only"
              />
            </div>
            <textarea
              ref={textareaRef}
              id="body"
              name="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onPaste={handlePaste}
              placeholder="撰写正文，支持直接粘贴剪贴板截图上传…"
            />
          </div>

          <div className="editor__pane">
            <div className="editor__bar">
              <span>预览</span>
            </div>
            {previewError && <p className="error" role="status">{previewError}</p>}
            <div className="editor__preview prose">
              {preview.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <p className="muted">空白画布。</p>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="editor-actions">
        <div className="editor-actions__left">
          <button form="post-editor-form" className="button button--primary" type="submit" disabled={saving}>
            {saving ? "保存中…" : post ? "保存更改" : "创建笔记"}
          </button>
        </div>

        {post && (
          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <button className="button button--danger-ghost" type="submit">
              删除笔记
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
