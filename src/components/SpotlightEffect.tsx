"use client";

import { useEffect } from "react";

/**
 * 全站卡片 3D 透视物理倾角（3D Tilt）+ 镜面高光（Specular Spotlight）+ 全息镭射折射（Holographic Foil）。
 * 纯 CSS 变量驱动，基于 rAF 物理插值与平滑阻尼回弹，prefers-reduced-motion 下自动优雅降级。
 */
export default function SpotlightEffect() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;

    const resetCardTilt = (card: HTMLElement) => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--tilt-scale", "1");
      card.style.setProperty("--foil-opacity", "0");
    };

    const onMouseMove = (event: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const mx = event.clientX;
        const my = event.clientY;

        const cards = document.querySelectorAll<HTMLElement>(
          ".post-card, .stack-card, [class*=\"proj_card__\"]"
        );

        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const x = mx - rect.left;
          const y = my - rect.top;

          // 仅在鼠标靠近卡片周围时计算（节约性能）
          if (
            x >= -100 &&
            x <= rect.width + 100 &&
            y >= -100 &&
            y <= rect.height + 100
          ) {
            card.style.setProperty("--mouse-x", `${Math.round(x)}px`);
            card.style.setProperty("--mouse-y", `${Math.round(y)}px`);

            // 如果鼠标位于卡片正上方，计算 3D 物理倾角与全息角度
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
              const px = (x - rect.width / 2) / (rect.width / 2); // -1 ~ 1
              const py = (y - rect.height / 2) / (rect.height / 2); // -1 ~ 1

              const maxTilt = 7.0; // 最大 7 度倾斜，克制精妙
              const tiltX = (-py * maxTilt).toFixed(2);
              const tiltY = (px * maxTilt).toFixed(2);
              const foilAngle = (px * 38 + 115).toFixed(1);

              card.style.setProperty("--tilt-x", `${tiltX}deg`);
              card.style.setProperty("--tilt-y", `${tiltY}deg`);
              card.style.setProperty("--tilt-scale", "1.018");
              card.style.setProperty("--foil-opacity", "1");
              card.style.setProperty("--foil-angle", `${foilAngle}deg`);
            } else {
              resetCardTilt(card);
            }
          } else {
            resetCardTilt(card);
          }
        });
      });
    };

    const onMouseLeaveDoc = () => {
      document
        .querySelectorAll<HTMLElement>(
          ".post-card, .stack-card, [class*=\"proj_card__\"]"
        )
        .forEach(resetCardTilt);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveDoc);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
    };
  }, []);

  return null;
}
