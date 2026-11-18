"use client";

import { useEffect } from "react";

const LANG_MAP: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Zsh",
  cs: "C#",
  csharp: "C#",
  json: "JSON",
  html: "HTML",
  xml: "XML",
  css: "CSS",
  scss: "SCSS",
  py: "Python",
  python: "Python",
  sql: "SQL",
  md: "Markdown",
  markdown: "Markdown",
  yaml: "YAML",
  yml: "YAML",
  dockerfile: "Dockerfile",
  docker: "Docker",
};

/**
 * 为正文代码块挂载出版级题头栏与复制动作。
 */
export default function CodeCopyButtons() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    for (const pre of document.querySelectorAll<HTMLPreElement>(".prose pre")) {
      if (pre.parentElement?.classList.contains("code-block")) continue;

      const rawLang = pre.getAttribute("data-lang") || "";
      const displayLang = LANG_MAP[rawLang] || (rawLang ? rawLang.toUpperCase() : "TEXT");

      const wrapper = document.createElement("div");
      wrapper.className = "code-block";

      const header = document.createElement("div");
      header.className = "code-block__header";

      const langSpan = document.createElement("span");
      langSpan.className = "code-block__lang";
      langSpan.textContent = displayLang;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.setAttribute("aria-label", "复制代码");
      button.textContent = "复制";

      let timer = 0;
      const onClick = async () => {
        window.clearTimeout(timer);
        const codeText = pre.querySelector("code")?.textContent ?? "";
        let success = false;

        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(codeText);
            success = true;
          }
        } catch {
          // 降级到 execCommand
        }

        if (!success) {
          try {
            const textarea = document.createElement("textarea");
            textarea.value = codeText;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.top = "0";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus({ preventScroll: true });
            textarea.select();
            textarea.setSelectionRange(0, codeText.length);
            success = document.execCommand("copy");
            document.body.removeChild(textarea);
          } catch {
            success = false;
          }
        }

        button.textContent = success ? "已复制" : "失败";
        if (success) button.classList.add("is-copied");

        timer = window.setTimeout(() => {
          button.textContent = "复制";
          button.classList.remove("is-copied");
        }, 1600);
      };

      button.addEventListener("click", onClick);

      header.appendChild(langSpan);
      header.appendChild(button);

      pre.replaceWith(wrapper);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);

      cleanups.push(() => {
        window.clearTimeout(timer);
        button.removeEventListener("click", onClick);
        wrapper.replaceWith(pre);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
