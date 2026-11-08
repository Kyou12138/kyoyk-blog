"use client";

import { useEffect } from "react";

/**
 * 卡片光斑微交互（Spotlight Hover Effect）。
 * 基于 rAF 更新当前指针相对卡片的坐标，prefers-reduced-motion 下自动跳过。
 */
export default function SpotlightEffect() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;

    const onMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const cards = document.querySelectorAll<HTMLElement>(".matrix-card, .arch-card");
        if (cards.length === 0) return;

        const mx = event.clientX;
        const my = event.clientY;

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const x = mx - rect.left;
          const y = my - rect.top;

          if (x >= -60 && x <= rect.width + 60 && y >= -60 && y <= rect.height + 60) {
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
