"use client";

import { useEffect } from "react";

/**
 * 按钮与核心交互元素磁性吸附微交互（Magnetic Pull & Spring Release）。
 * 当指针临近目标元素时，元素沿鼠标方向产生弹性磁吸位移；移出时通过弹簧阻尼回弹至原位。
 * 在 prefers-reduced-motion 下自动跳过。
 */
export default function MagneticPull() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const mx = e.clientX;
        const my = e.clientY;

        const targets = document.querySelectorAll<HTMLElement>(
          "[data-magnetic], .search-trigger, .heroAction, .heroActionGhost"
        );

        targets.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dx = mx - centerX;
          const dy = my - centerY;
          const dist = Math.hypot(dx, dy);

          // 磁场半径：元素外延 38px
          const maxDist = Math.max(rect.width, rect.height) * 0.75 + 38;

          if (dist < maxDist) {
            const pull = (1 - dist / maxDist) * 0.28;
            const tx = dx * pull;
            const ty = dy * pull;

            el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
            el.style.transition = "transform 80ms ease-out";
          } else {
            if (el.style.transform && el.style.transform !== "translate3d(0px, 0px, 0px)") {
              el.style.transform = "translate3d(0px, 0px, 0px)";
              el.style.transition =
                "transform 420ms cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            }
          }
        });
      });
    };

    const onMouseLeave = () => {
      document
        .querySelectorAll<HTMLElement>(
          "[data-magnetic], .search-trigger, .heroAction, .heroActionGhost"
        )
        .forEach((el) => {
          el.style.transform = "translate3d(0px, 0px, 0px)";
          el.style.transition =
            "transform 420ms cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return null;
}
