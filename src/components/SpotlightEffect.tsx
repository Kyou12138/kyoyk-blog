"use client";

import { useEffect } from "react";

/**
 * 全站卡片鼠标流光聚光灯（Spotlight Glow）。
 * 纯 CSS 变量驱动，节流 rAF，只计算视口内贴近鼠标的卡片，prefers-reduced-motion 下自动跳过。
 */
export default function SpotlightEffect() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    const onMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const cards = document.querySelectorAll<HTMLElement>(
          ".post-card, .stack-card, [class*=\"proj_card__\"], [class*=\"heroFlowItem\"]",
        );

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          // 仅在鼠标靠近该卡片周围时计算，节约大量重绘
          if (
            x >= -120 &&
            x <= rect.width + 120 &&
            y >= -120 &&
            y <= rect.height + 120
          ) {
            card.style.setProperty("--mouse-x", `${Math.round(x)}px`);
            card.style.setProperty("--mouse-y", `${Math.round(y)}px`);
          }
        });
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return null;
}
