import { useEffect, useRef, type ReactElement } from "react";

type HeroCanvasBackgroundProps = {
  className?: string;
};

type Orb = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  hue: number;
  alpha: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readIsDark(): boolean {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export default function HeroCanvasBackground({
  className,
}: HeroCanvasBackgroundProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isDark = readIsDark();
    let rafId = 0;
    let lastTs = 0;
    let orbs: Orb[] = [];

    const pointer = {
      x: 0,
      y: 0,
      active: false,
    };

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initOrbs = () => {
      const orbCount = clamp(Math.floor(width / 120), 5, 11);
      orbs = Array.from({ length: orbCount }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 110 + Math.random() * 130,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.22,
        hue: isDark
          ? 35 + Math.random() * 25
          : index % 2 === 0
            ? 38 + Math.random() * 22
            : 195 + Math.random() * 20,
        alpha: 0.09 + Math.random() * 0.12,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = clamp(window.devicePixelRatio || 1, 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      pointer.x = width * 0.55;
      pointer.y = height * 0.4;
      initOrbs();
    };

    const drawBase = (timeSec: number) => {
      const moveX = Math.sin(timeSec * 0.23) * width * 0.1;
      const moveY = Math.cos(timeSec * 0.19) * height * 0.08;

      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (isDark) {
        grad.addColorStop(0, "#16120f");
        grad.addColorStop(0.48, "#26201a");
        grad.addColorStop(1, "#120f0d");
      } else {
        grad.addColorStop(0, "#0b1a29");
        grad.addColorStop(0.52, "#15334a");
        grad.addColorStop(1, "#0e1f31");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const halo = ctx.createRadialGradient(
        width * 0.17 + moveX,
        height * 0.2 + moveY,
        10,
        width * 0.17 + moveX,
        height * 0.2 + moveY,
        width * 0.65
      );
      halo.addColorStop(0, isDark ? "rgba(209,153,71,0.26)" : "rgba(255,212,96,0.24)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
    };

    const drawGrid = (timeSec: number) => {
      const grid = 34;
      const offset = (timeSec * 16) % grid;
      ctx.save();
      ctx.globalAlpha = isDark ? 0.08 : 0.1;
      ctx.strokeStyle = "rgba(225, 236, 255, 0.32)";
      ctx.lineWidth = 1;

      for (let x = -grid; x <= width + grid; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, height);
        ctx.stroke();
      }
      for (let y = -grid; y <= height + grid; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset * 0.5);
        ctx.lineTo(width, y + offset * 0.5);
        ctx.stroke();
      }
      ctx.restore();
    };

    const updateAndDrawOrbs = (dt: number, timeSec: number) => {
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (const orb of orbs) {
        if (!prefersReducedMotion) {
          orb.x += orb.vx * dt * 1.6;
          orb.y += orb.vy * dt * 1.6;

          if (pointer.active) {
            const dx = pointer.x - orb.x;
            const dy = pointer.y - orb.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const force = clamp(1 - dist / 320, 0, 1) * 0.55;
            orb.x += (dx / dist) * force * dt * 1.2;
            orb.y += (dy / dist) * force * dt * 1.2;
          }
        }

        if (orb.x < -orb.r) orb.x = width + orb.r;
        if (orb.x > width + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = height + orb.r;
        if (orb.y > height + orb.r) orb.y = -orb.r;

        const pulse = 0.85 + Math.sin(timeSec * 0.9 + orb.hue) * 0.15;
        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.r * pulse
        );
        gradient.addColorStop(0, `hsla(${orb.hue}, 92%, 68%, ${orb.alpha})`);
        gradient.addColorStop(1, `hsla(${orb.hue}, 92%, 68%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawScanline = (timeSec: number) => {
      if (prefersReducedMotion) return;
      const y = (timeSec * 95) % (height + 90) - 45;
      const line = ctx.createLinearGradient(0, y - 30, 0, y + 30);
      line.addColorStop(0, "rgba(255,255,255,0)");
      line.addColorStop(0.5, "rgba(255,255,255,0.1)");
      line.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = line;
      ctx.fillRect(0, y - 30, width, 60);
    };

    const render = (ts: number) => {
      const dt = lastTs ? clamp((ts - lastTs) / 16.667, 0.7, 2) : 1;
      lastTs = ts;
      const timeSec = ts / 1000;

      drawBase(timeSec);
      drawGrid(timeSec);
      updateAndDrawOrbs(dt, timeSec);
      drawScanline(timeSec);

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    const handleMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };

    const handleLeave = () => {
      pointer.active = false;
    };

    const themeObserver = new MutationObserver(() => {
      isDark = readIsDark();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    resize();
    render(performance.now());

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", handleMove);
      canvas.removeEventListener("pointerleave", handleLeave);
      window.cancelAnimationFrame(rafId);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
