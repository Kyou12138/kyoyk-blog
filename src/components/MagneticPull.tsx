"use client";

import { useEffect } from "react";

/**
 * 克制型触觉磁吸微交互：仅在精细指针设备与非减弱动画偏好下激活。
 */
export default function MagneticPull({ ink }: { ink: boolean }) {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const mx = e.clientX;
        const my = e.clientY;
        const targets = document.querySelectorAll<HTMLElement>("[data-magnetic]");

        targets.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const dx = mx - (rect.left + rect.width / 2);
          const dy = my - (rect.top + rect.height / 2);
          const dist = Math.hypot(dx, dy);
          const maxDist = Math.max(rect.width, rect.height) * (ink ? 0.75 : 0.65) + (ink ? 38 : 24);

          if (dist < maxDist) {
            const pull = (1 - dist / maxDist) * (ink ? 0.28 : 0.16);
            el.style.transform = `translate3d(${(dx * pull).toFixed(1)}px, ${(dy * pull).toFixed(1)}px, 0)`;
            el.style.transition = "transform 90ms ease-out";
          } else if (el.style.transform && el.style.transform !== "translate3d(0px, 0px, 0px)") {
            el.style.transform = "translate3d(0px, 0px, 0px)";
            el.style.transition = "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)";
          }
        });
      });
    };

    const resetAll = () => {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        el.style.transform = "translate3d(0px, 0px, 0px)";
        el.style.transition = "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)";
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", resetAll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", resetAll);
    };
  }, [ink]);

  return null;
}
