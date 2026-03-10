import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  getStorageKey,
  isUnlockedByCache,
  verifyInputPassword,
} from "../utils/noteGate";

type EncryptedNoteGateProps = {
  enabled: boolean;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  passwordIterations?: number | string;
  passwordHint?: string;
  permalink?: string;
  children: ReactNode;
};

export default function EncryptedNoteGate({
  enabled,
  password,
  passwordHash,
  passwordSalt,
  passwordIterations,
  passwordHint,
  permalink,
  children,
}: EncryptedNoteGateProps): ReactNode {
  const [unlocked, setUnlocked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const hasPassword = Boolean(password && password.trim().length > 0);
  const hasHash = Boolean(passwordHash && passwordHash.trim().length > 0);
  const needsPassword = enabled || hasPassword || hasHash;
  const passwordConfig = {
    password,
    passwordHash,
    passwordSalt,
    passwordIterations,
  };

  const storageKey = useMemo(
    () => getStorageKey(permalink),
    [permalink]
  );

  useEffect(() => {
    if (!needsPassword) return;
    if (typeof window === "undefined") return;

    let active = true;

    const hydrate = async () => {
      const unlockedByCache = await isUnlockedByCache(
        passwordConfig,
        permalink
      );
      if (!active || !unlockedByCache) return;
      setUnlocked(true);
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, [
    needsPassword,
    password,
    passwordHash,
    passwordSalt,
    passwordIterations,
    permalink,
    storageKey,
  ]);

  if (!needsPassword) {
    return children;
  }

  if (unlocked) {
    return children;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    setChecking(true);

    try {
      const result = await verifyInputPassword(inputValue, passwordConfig);
      if (!result.ok) {
        setError(result.error ?? "密码不正确，请再试一次。");
        return;
      }

      window.localStorage.setItem(storageKey, result.signature!);
      setUnlocked(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="ky-note-gate" aria-live="polite">
      <div className="ky-note-gate__header">
        <p className="ky-note-gate__eyebrow">加密笔记</p>
        <h2 className="ky-note-gate__title">此内容需要密码解锁</h2>
        <p className="ky-note-gate__desc">
          请输入正确的访问密码后继续阅读，密码会保存在本地浏览器中。
        </p>
      </div>

      <form className="ky-note-gate__form" onSubmit={handleSubmit}>
        <label className="ky-note-gate__label" htmlFor="ky-note-password">
          访问密码
        </label>
        <input
          id="ky-note-password"
          className="ky-note-gate__input"
          type="password"
          autoComplete="current-password"
          placeholder="输入密码"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "ky-note-gate-error" : undefined}
        />
        {passwordHint && (
          <p className="ky-note-gate__hint">提示：{passwordHint}</p>
        )}
        {error && (
          <p id="ky-note-gate-error" className="ky-note-gate__error">
            {error}
          </p>
        )}
        <button
          className={clsx("button button--primary ky-note-gate__submit")}
          type="submit"
          disabled={checking}
        >
          {checking ? "校验中..." : "解锁阅读"}
        </button>
      </form>
    </div>
  );
}
