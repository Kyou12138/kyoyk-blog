import { useEffect, useRef, type ReactElement } from "react";

type BootLoaderCanvasProps = {
  className?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isDarkTheme(): boolean {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export default function BootLoaderCanvas({
  className,
}: BootLoaderCanvasProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let darkMode = isDarkTheme();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = clamp(window.devicePixelRatio || 1, 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (ts: number) => {
      const time = ts / 1000;
      const cx = width * 0.5;
      const cy = height * 0.5;
      const baseRadius = Math.min(width, height) * 0.34;

      ctx.clearRect(0, 0, width, height);

      const haloOuterRadius = baseRadius * 1.5;
      const halo = ctx.createRadialGradient(
        cx,
        cy,
        8,
        cx,
        cy,
        haloOuterRadius
      );
      halo.addColorStop(0, darkMode ? "rgba(217, 167, 84, 0.3)" : "rgba(204, 143, 47, 0.3)");
      halo.addColorStop(0.58, darkMode ? "rgba(217, 167, 84, 0.08)" : "rgba(204, 143, 47, 0.08)");
      halo.addColorStop(0.78, darkMode ? "rgba(217, 167, 84, 0.02)" : "rgba(204, 143, 47, 0.02)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      const ringConfigs = [
        { radius: baseRadius * 0.72, line: 4, speed: 1.55, span: 1.15 },
        { radius: baseRadius, line: 3, speed: -1.15, span: 0.94 },
        { radius: baseRadius * 1.24, line: 2.4, speed: 0.82, span: 0.74 },
      ] as const;

      ringConfigs.forEach((ring, idx) => {
        const start = time * ring.speed + idx * 1.4;
        const end = start + ring.span;
        const grad = ctx.createLinearGradient(
          cx - ring.radius,
          cy - ring.radius,
          cx + ring.radius,
          cy + ring.radius
        );
        if (darkMode) {
          grad.addColorStop(0, "rgba(255, 213, 124, 0.14)");
          grad.addColorStop(0.5, "rgba(255, 213, 124, 0.88)");
          grad.addColorStop(1, "rgba(255, 213, 124, 0.12)");
        } else {
          grad.addColorStop(0, "rgba(196, 122, 25, 0.18)");
          grad.addColorStop(0.5, "rgba(204, 143, 47, 0.9)");
          grad.addColorStop(1, "rgba(196, 122, 25, 0.16)");
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = ring.line;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, start, end);
        ctx.stroke();
      });

      const pulse = 0.82 + (prefersReducedMotion ? 0 : Math.sin(time * 3.2) * 0.08);
      ctx.fillStyle = darkMode ? "rgba(255, 220, 155, 0.92)" : "rgba(169, 99, 14, 0.95)";
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.16 * pulse, 0, Math.PI * 2);
      ctx.fill();

      if (!prefersReducedMotion) {
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < 12; i += 1) {
          const orbit = baseRadius * (0.8 + (i % 3) * 0.2);
          const angle = time * (0.72 + i * 0.09) + i * 0.55;
          const x = cx + Math.cos(angle) * orbit;
          const y = cy + Math.sin(angle) * orbit;
          ctx.fillStyle = darkMode
            ? "rgba(255, 212, 120, 0.72)"
            : "rgba(204, 143, 47, 0.76)";
          ctx.beginPath();
          ctx.arc(x, y, 1.2 + (i % 2) * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      rafId = window.requestAnimationFrame(draw);
    };

    const themeObserver = new MutationObserver(() => {
      darkMode = isDarkTheme();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    resize();
    draw(performance.now());
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(rafId);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
