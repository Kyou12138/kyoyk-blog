"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NoteGate({ postId, hint }: { postId: string; hint: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch(`/api/notes/${postId}/unlock`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setPending(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "解锁失败，请重试。");
      return;
    }

    setPassword("");
    router.refresh();
  };

  return (
    <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      <h3>🔒 这是一篇私有笔记</h3>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        {hint ? `密码提示：${hint}` : "输入密码后查看正文，解锁状态保留 24 小时。"}
      </p>
      <div className="field">
        <label htmlFor="note-password">密码</label>
        <input
          id="note-password"
          type="password"
          autoComplete="off"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "校验中…" : "解锁"}
      </button>
    </form>
  );
}
