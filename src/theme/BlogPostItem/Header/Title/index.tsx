import React, {
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import { useHistory } from "@docusaurus/router";
import type { Props } from "@theme/BlogPostItem/Header/Title";
import {
  getStorageKey,
  isUnlockedByCache,
  verifyInputPassword,
} from "../../../../utils/noteGate";

import styles from "./styles.module.css";

type EncryptedFrontMatter = {
  encrypted?: boolean;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  passwordIterations?: number | string;
  passwordHint?: string;
};

export default function BlogPostItemHeaderTitle({
  className,
}: Props): ReactNode {
  const { metadata, isBlogPostPage, frontMatter } = useBlogPost();
  const { permalink, title } = metadata;
  const history = useHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const encryptedFrontMatter = frontMatter as EncryptedFrontMatter;
  const needsPassword = Boolean(
    encryptedFrontMatter.encrypted ||
      encryptedFrontMatter.password ||
      encryptedFrontMatter.passwordHash
  );
  const passwordConfig = {
    password: encryptedFrontMatter.password,
    passwordHash: encryptedFrontMatter.passwordHash,
    passwordSalt: encryptedFrontMatter.passwordSalt,
    passwordIterations: encryptedFrontMatter.passwordIterations,
  };

  const modalIdBase = useMemo(
    () => `ky-note-modal-${permalink.replace(/[^a-z0-9]/gi, "") || "note"}`,
    [permalink]
  );
  const modalTitleId = `${modalIdBase}-title`;
  const modalDescId = `${modalIdBase}-desc`;
  const modalErrorId = `${modalIdBase}-error`;
  const modalInputId = `${modalIdBase}-input`;

  useEffect(() => {
    if (!isOpen) return;
    if (typeof document === "undefined") return;

    document.body.classList.add("ky-note-modal-open");
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("ky-note-modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false);
      setInputValue("");
      setError(null);
      setChecking(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const openModal = () => {
    setInputValue("");
    setError(null);
    setChecking(false);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setInputValue("");
    setError(null);
    setChecking(false);
  };

  const handleClick = async (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (isBlogPostPage || !needsPassword) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    if (typeof window === "undefined") return;

    event.preventDefault();

    const unlockedByCache = await isUnlockedByCache(
      passwordConfig,
      permalink
    );
    if (unlockedByCache) {
      history.push(permalink);
      return;
    }

    openModal();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (checking) return;

    setChecking(true);
    const result = await verifyInputPassword(inputValue, passwordConfig);
    if (!result.ok) {
      setError(result.error ?? "密码不正确，请再试一次。");
      setChecking(false);
      return;
    }

    window.localStorage.setItem(
      getStorageKey(permalink),
      result.signature!
    );
    closeModal();
    history.push(permalink);
  };

  const TitleHeading = isBlogPostPage ? "h1" : "h2";
  const titleContent = (
    <span className={styles.titleContent}>
      {needsPassword && (
        <span className={styles.lockIcon} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6.5 11V8a5.5 5.5 0 0 1 11 0v3" />
            <rect x="4.5" y="11" width="15" height="10" rx="2.5" />
            <path d="M12 15.5v2.5" />
          </svg>
        </span>
      )}
      <span className={styles.titleText}>{title}</span>
    </span>
  );
  const modal = isOpen ? (
    <div
      className="ky-note-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      aria-describedby={modalDescId}
      onClick={closeModal}
    >
      <div
        className="ky-note-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ky-note-modal__badge">加密笔记</div>
        <h3 id={modalTitleId} className="ky-note-modal__title">
          输入密码后继续阅读
        </h3>
        <p id={modalDescId} className="ky-note-modal__desc">
          输入正确密码后将自动进入内容页，本次解锁会保存在浏览器中。
        </p>
        <form className="ky-note-modal__form" onSubmit={handleSubmit}>
          <label className="ky-note-modal__label" htmlFor={modalInputId}>
            访问密码
          </label>
          <input
            ref={inputRef}
            id={modalInputId}
            className="ky-note-modal__input"
            type="password"
            autoComplete="current-password"
            placeholder="输入密码"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? modalErrorId : undefined}
            disabled={checking}
          />
          {encryptedFrontMatter.passwordHint && (
            <p className="ky-note-modal__hint">
              提示：{encryptedFrontMatter.passwordHint}
            </p>
          )}
          {error && (
            <p id={modalErrorId} className="ky-note-modal__error">
              {error}
            </p>
          )}
          <div className="ky-note-modal__actions">
            <button
              type="button"
              className="button button--secondary ky-note-modal__button"
              onClick={closeModal}
              disabled={checking}
            >
              取消
            </button>
            <button
              type="submit"
              className="button button--primary ky-note-modal__button"
              disabled={checking}
            >
              {checking ? "校验中..." : "解锁并进入"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <TitleHeading className={clsx(styles.title, className)}>
        {isBlogPostPage ? (
          titleContent
        ) : (
          <Link to={permalink} onClick={handleClick}>
            {titleContent}
          </Link>
        )}
      </TitleHeading>
      {isOpen && typeof document !== "undefined"
        ? createPortal(modal, document.body)
        : null}
    </>
  );
}
