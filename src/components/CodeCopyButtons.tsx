"use client";

import { useEffect } from "react";

const LANG_MAP: Record<string, string> = {
  ts: "TypeScript",
  typescript: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
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
 * 给正文代码块挂接语言头与复制按钮。
 * 包含 Mac 风格三点、规范化语言标识与平滑复制反馈。
 */
export default function CodeCopyButtons() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    for (const pre of document.querySelectorAll<HTMLPreElement>(".prose pre")) {
      if (pre.parentElement?.classList.contains("code-block")) continue;

      const rawLang = pre.getAttribute("data-lang") || "";
      const displayLang = LANG_MAP[rawLang] || (rawLang ? rawLang.toUpperCase() : "CODE");

      const wrapper = document.createElement("div");
      wrapper.className = "code-block";

      const header = document.createElement("div");
      header.className = "code-block__header";

      const meta = document.createElement("div");
      meta.className = "code-block__meta";

      const dots = document.createElement("span");
      dots.className = "code-block__dots";
      dots.setAttribute("aria-hidden", "true");
      dots.innerHTML = "<i></i><i></i><i></i>";

      const langSpan = document.createElement("span");
      langSpan.className = "code-block__lang";
      langSpan.textContent = displayLang;

      meta.appendChild(dots);
      meta.appendChild(langSpan);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.setAttribute("aria-label", "复制代码");
      button.innerHTML = '<span class="code-copy__icon" aria-hidden="true">📋</span><span class="code-copy__text">复制</span>';

      let timer = 0;
      const onClick = async () => {
        window.clearTimeout(timer);
        const textSpan = button.querySelector<HTMLSpanElement>(".code-copy__text");
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
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            success = document.execCommand("copy");
            document.body.removeChild(textarea);
          } catch {
            success = false;
          }
        }

        if (textSpan) textSpan.textContent = success ? "已复制" : "复制失败";
        if (success) button.classList.add("is-copied");

        timer = window.setTimeout(() => {
          if (textSpan) textSpan.textContent = "复制";
          button.classList.remove("is-copied");
        }, 1600);
      };

      button.addEventListener("click", onClick);

      header.appendChild(meta);
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
