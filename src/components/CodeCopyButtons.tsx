"use client";

import { useEffect } from "react";

/**
 * 给正文里每个代码块挂一个复制按钮。
 * 用 DOM 后置增强而不是改 markdown-it 渲染，避免把高亮结果再包一层 React 树。
 */
export default function CodeCopyButtons() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    for (const pre of document.querySelectorAll<HTMLPreElement>(".prose pre")) {
      if (pre.parentElement?.classList.contains("code-block")) continue;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block";
      pre.replaceWith(wrapper);
      wrapper.appendChild(pre);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "复制";

      let timer = 0;
      const onClick = async () => {
        window.clearTimeout(timer);
        try {
          await navigator.clipboard.writeText(pre.querySelector("code")?.textContent ?? "");
          button.textContent = "已复制";
        } catch {
          button.textContent = "复制失败";
        }
        timer = window.setTimeout(() => {
          button.textContent = "复制";
        }, 1600);
      };

      button.addEventListener("click", onClick);
      wrapper.appendChild(button);

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
