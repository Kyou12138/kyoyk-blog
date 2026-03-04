import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import BootLoaderCanvas from "../components/BootLoaderCanvas";

type BootPhase = "loading" | "leaving" | "done";

type RootProps = {
  children: ReactNode;
};

const EXIT_DURATION_MS = 360;
const MIN_VISIBLE_MS = 880;
const NAVBAR_FLOAT_SCROLL_Y = 12;

export default function Root({ children }: RootProps): ReactNode {
  const [phase, setPhase] = useState<BootPhase>("loading");

  useEffect(() => {
    let revealTimer = 0;
    let doneTimer = 0;
    let cleaned = false;
    const startAt = performance.now();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const reveal = () => {
      if (cleaned) return;

      const elapsed = performance.now() - startAt;
      const minDuration = prefersReducedMotion ? 0 : MIN_VISIBLE_MS;
      const waitMs = Math.max(0, minDuration - elapsed);

      revealTimer = window.setTimeout(() => {
        if (cleaned) return;
        setPhase("leaving");
        doneTimer = window.setTimeout(() => {
          if (cleaned) return;
          setPhase("done");
        }, prefersReducedMotion ? 120 : EXIT_DURATION_MS);
      }, waitMs);
    };

    if (document.readyState === "complete") {
      reveal();
    } else {
      window.addEventListener("load", reveal, { once: true });
    }

    return () => {
      cleaned = true;
      window.removeEventListener("load", reveal);
      window.clearTimeout(revealTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    const loading = phase !== "done";
    document.documentElement.classList.toggle("ky-boot-lock", loading);
    document.body.classList.toggle("ky-boot-lock", loading);

    return () => {
      document.documentElement.classList.remove("ky-boot-lock");
      document.body.classList.remove("ky-boot-lock");
    };
  }, [phase]);

  useEffect(() => {
    const root = document.documentElement;
    let frameId = 0;

    const syncNavbarState = () => {
      frameId = 0;
      root.classList.toggle(
        "ky-navbar-scrolled",
        window.scrollY > NAVBAR_FLOAT_SCROLL_Y
      );
    };

    const scheduleSync = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(syncNavbarState);
    };

    syncNavbarState();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);

    return () => {
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      root.classList.remove("ky-navbar-scrolled");
    };
  }, []);

  return (
    <>
      <noscript>
        <style>
          {`.ky-boot-loader{display:none !important}.ky-app-shell--loading{opacity:1 !important;visibility:visible !important;pointer-events:auto !important}`}
        </style>
      </noscript>

      <div
        className={clsx(
          "ky-app-shell",
          phase === "loading" && "ky-app-shell--loading"
        )}
      >
        {children}
      </div>

      {phase !== "done" && (
        <div
          className={clsx(
            "ky-boot-loader",
            phase === "leaving" && "ky-boot-loader--leaving"
          )}
          role="status"
          aria-live="polite"
          aria-label="页面资源加载中"
        >
          <BootLoaderCanvas className="ky-boot-loader__canvas" />
          <div className="ky-boot-loader__core">
            <div className="ky-boot-loader__badge">KYOYK</div>
            <div className="ky-boot-loader__ring" aria-hidden="true" />
            <p className="ky-boot-loader__text">正在加载资源...</p>
          </div>
        </div>
      )}
    </>
  );
}
