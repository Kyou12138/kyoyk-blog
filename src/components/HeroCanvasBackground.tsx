"use client";

import { useEffect, useRef, type ReactElement } from "react";

type HeroCanvasBackgroundProps = {
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  size: number;
  hue: number;
  alpha: number;
  mass: number;
};

type Shockwave = {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
    let rafId = 0;
    let lastTs = 0;
    let particles: Particle[] = [];
    let shockwaves: Shockwave[] = [];

    const pointer = {
      x: -9999,
      y: -9999,
      smoothX: -9999,
      smoothY: -9999,
      active: false,
    };

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initParticles = () => {
      // 300+ 粒子：根据视口面积动态调整，移动端保 220，桌面端 320~400
      const count = clamp(Math.floor((width * height) / 2800), 220, 400);
      particles = Array.from({ length: count }, () => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const isCyan = Math.random() < 0.16; // 84% 琥珀金，16% 电光青
        return {
          x,
          y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          originX: x,
          originY: y,
          size: 1.1 + Math.random() * 1.8,
          hue: isCyan ? 198 + Math.random() * 20 : 38 + Math.random() * 22,
          alpha: 0.35 + Math.random() * 0.55,
          mass: 0.8 + Math.random() * 0.8,
        };
      });
    };

    const addShockwave = (x: number, y: number) => {
      if (prefersReducedMotion) return;
      shockwaves.push({
        x,
        y,
        radius: 6,
        maxRadius: Math.max(width, height) * 0.65,
        speed: 12 + Math.random() * 4,
        opacity: 0.85,
      });
      if (shockwaves.length > 4) shockwaves.shift();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = clamp(window.devicePixelRatio || 1, 1, 1.5); // 限制 1.5x 保障 60fps

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles();
    };

    const drawBackground = (timeSec: number) => {
      // 深度暗金流体底色
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#13100e");
      grad.addColorStop(0.5, "#1f1914");
      grad.addColorStop(1, "#100d0c");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 居中偏左微光呼吸晕
      const haloX = width * 0.28 + Math.sin(timeSec * 0.3) * (width * 0.08);
      const haloY = height * 0.38 + Math.cos(timeSec * 0.25) * (height * 0.06);
      const halo = ctx.createRadialGradient(haloX, haloY, 20, haloX, haloY, width * 0.62);
      halo.addColorStop(0, "rgba(209, 153, 71, 0.22)");
      halo.addColorStop(0.55, "rgba(168, 110, 32, 0.07)");
      halo.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
    };

    const updateShockwaves = () => {
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.opacity *= 0.96;

        ctx.save();
        ctx.strokeStyle = `rgba(209, 153, 71, ${sw.opacity * 0.7})`;
        ctx.lineWidth = clamp(sw.opacity * 3.5, 0.5, 3.5);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(111, 236, 255, ${sw.opacity * 0.35})`;
        ctx.lineWidth = clamp(sw.opacity * 1.5, 0.5, 2);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        if (sw.radius > sw.maxRadius || sw.opacity < 0.02) {
          shockwaves.splice(i, 1);
        }
      }
    };

    const updateAndDrawParticles = (dt: number, timeSec: number) => {
      if (pointer.active) {
        if (pointer.smoothX < -1000) {
          pointer.smoothX = pointer.x;
          pointer.smoothY = pointer.y;
        } else {
          pointer.smoothX += (pointer.x - pointer.smoothX) * 0.12;
          pointer.smoothY += (pointer.y - pointer.smoothY) * 0.12;
        }
      }

      const vortexRadius = 260;
      const vortexRadiusSq = vortexRadius * vortexRadius;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          // 1. 鼠标引力漩涡（Gravitational Vortex）
          if (pointer.active) {
            const dx = pointer.smoothX - p.x;
            const dy = pointer.smoothY - p.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < vortexRadiusSq && distSq > 4) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / vortexRadius) * 0.52;

              // 向心引力
              const fx = (dx / dist) * force * 1.35;
              const fy = (dy / dist) * force * 1.35;

              // 切向回旋角动量
              const swirlX = (-dy / dist) * force * 1.75;
              const swirlY = (dx / dist) * force * 1.75;

              p.vx += (fx + swirlX) / p.mass;
              p.vy += (fy + swirlY) / p.mass;
            }
          }

          // 2. 冲击波外推脉冲
          for (const sw of shockwaves) {
            const dx = p.x - sw.x;
            const dy = p.y - sw.y;
            const dist = Math.hypot(dx, dy);
            const waveDiff = Math.abs(dist - sw.radius);

            if (waveDiff < 45 && dist > 1) {
              const push = (1 - waveDiff / 45) * sw.opacity * 9.5;
              p.vx += (dx / dist) * (push / p.mass);
              p.vy += (dy / dist) * (push / p.mass);
            }
          }

          // 3. 基础漂移与弹性复位
          const driftX = Math.sin(timeSec * 0.8 + i) * 0.12;
          const driftY = Math.cos(timeSec * 0.7 + i) * 0.12;
          p.vx += driftX;
          p.vy += driftY;

          const toOriginX = (p.originX - p.x) * 0.003;
          const toOriginY = (p.originY - p.y) * 0.003;
          p.vx += toOriginX;
          p.vy += toOriginY;

          // 速度阻尼
          p.vx *= 0.94;
          p.vy *= 0.94;

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.x < -30) p.x = width + 25;
          if (p.x > width + 30) p.x = -25;
          if (p.y < -30) p.y = height + 25;
          if (p.y > height + 30) p.y = -25;
        }

        // 绘制粒子
        const pulse = 0.85 + Math.sin(timeSec * 2.5 + i * 0.5) * 0.15;
        const currentAlpha = p.alpha * pulse;

        ctx.fillStyle = `hsla(${p.hue}, 92%, 68%, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. 星座连线（保持 60fps 的步长检查）
      const maxConnectDist = 60;
      const maxDistSq = maxConnectDist * maxConnectDist;
      ctx.lineWidth = 0.8;

      for (let i = 0; i < particles.length; i += 2) {
        const p1 = particles[i];
        for (let j = i + 1; j < Math.min(i + 12, particles.length); j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxConnectDist) * 0.22;
            ctx.strokeStyle = `rgba(209, 153, 71, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    const render = (ts: number) => {
      if (document.hidden) {
        rafId = window.requestAnimationFrame(render);
        return;
      }

      const dt = lastTs ? clamp((ts - lastTs) / 16.667, 0.7, 2) : 1;
      lastTs = ts;
      const timeSec = ts / 1000;

      drawBackground(timeSec);
      updateShockwaves();
      updateAndDrawParticles(dt, timeSec);

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    const container = canvas.parentElement ?? canvas;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.smoothX = -9999;
      pointer.smoothY = -9999;
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      addShockwave(clickX, clickY);
    };

    resize();
    render(performance.now());

    window.addEventListener("resize", resize);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    container.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("pointerdown", handlePointerDown);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
