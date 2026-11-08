"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export type GraphPost = { title: string; href: string; tags: string[] };

type Node = {
  id: string;
  kind: "tag" | "post";
  label: string;
  href: string;
  count?: number;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
};

const TAG = "#e5a742";
const TAG_BG = "#14110a";
const POST = "#7d8ea8";
const LIT = "#f4f5f6";

export default function KnowledgeGraph({ posts }: { posts: GraphPost[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // ---- 1. 构建图结构 ----
    const counts = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));

    const nodes: Node[] = [];
    const index = new Map<string, Node>();

    const add = (n: Omit<Node, "x" | "y" | "vx" | "vy" | "phase">) => {
      const a = Math.random() * Math.PI * 2;
      const node: Node = {
        ...n,
        x: Math.cos(a) * 120,
        y: Math.sin(a) * 120,
        vx: 0,
        vy: 0,
        phase: a,
      };
      nodes.push(node);
      index.set(node.id, node);
    };

    // 标签节点：按文章数缩放大小
    counts.forEach((c, t) => {
      add({
        id: `t:${t}`,
        kind: "tag",
        label: t,
        href: `/blog/tags/${encodeURIComponent(t)}`,
        count: c,
        r: Math.max(7, Math.min(16, 6 + Math.sqrt(c) * 2.4)),
      });
    });

    // 笔记节点
    posts.forEach((p) => {
      add({
        id: `p:${p.href}`,
        kind: "post",
        label: p.title,
        href: p.href,
        r: 3.5,
      });
    });

    const links = posts.flatMap((p) =>
      p.tags
        .map((t) => [index.get(`p:${p.href}`)!, index.get(`t:${t}`)!] as const)
        .filter(([a, b]) => a && b),
    );

    const neighbors = new Map<Node, Set<Node>>(nodes.map((n) => [n, new Set()]));
    links.forEach(([a, b]) => {
      neighbors.get(a)!.add(b);
      neighbors.get(b)!.add(a);
    });

    // ---- 2. 力导向预收敛（首帧即稳定，不抖动） ----
    const step = () => {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = Math.max(dx * dx + dy * dy, 36);
          const f = (a.kind === "tag" && b.kind === "tag" ? 2800 : 560) / d2;
          const d = Math.sqrt(d2);
          a.vx += (dx / d) * f;
          a.vy += (dy / d) * f;
          b.vx -= (dx / d) * f;
          b.vy -= (dy / d) * f;
        }
      }
      for (const [p, t] of links) {
        const dx = t.x - p.x;
        const dy = t.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - 48) * 0.022;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
        t.vx -= (dx / d) * f * 0.28;
        t.vy -= (dy / d) * f * 0.28;
      }
      for (const n of nodes) {
        n.vx -= n.x * 0.0042;
        n.vy -= n.y * 0.0042;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
      }
    };
    for (let i = 0; i < 420; i++) step();

    // ---- 3. 画布尺寸自适应 ----
    let w = 0;
    let h = 0;
    let scale = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const extent = Math.max(...nodes.map((n) => Math.max(Math.abs(n.x), Math.abs(n.y)) + n.r)) || 1;
      scale = Math.min(w, h) / 2 / (extent + 36);
    };
    resize();

    const display = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim();
    const font = (px: number, weight = 600) =>
      `${weight} ${px}px ${display || "sans-serif"}, system-ui, -apple-system, sans-serif`;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let hover: Node | null = null;
    let pointerX = -9999;
    let pointerY = -9999;
    let t = 0;

    // 坐标映射 + 微弱悬浮漂移 + 鼠标引力微扰
    const pos = (n: Node) => {
      const drift = reduced ? 0 : n.kind === "post" ? 2.2 : 1.2;
      let bx = w / 2 + n.x * scale + Math.sin(t + n.phase) * drift;
      let by = h / 2 + n.y * scale + Math.cos(t * 0.8 + n.phase) * drift;

      // 鼠标附近的微引力脉冲
      if (!reduced && pointerX > 0) {
        const dx = pointerX - bx;
        const dy = pointerY - by;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 120) {
          const pull = (1 - dist / 120) * 3.5;
          bx += (dx / dist) * pull;
          by += (dy / dist) * pull;
        }
      }

      return { x: bx, y: by };
    };

    // ---- 4. 渲染循环 ----
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // 背景中心琥珀微光星云
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.45);
      grad.addColorStop(0, "rgba(229, 167, 66, 0.04)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const lit = hover ? new Set([hover, ...neighbors.get(hover)!]) : null;

      // 绘制连线
      for (const [p, tg] of links) {
        const on = lit && hover && (p === hover || tg === hover);
        const a = pos(p);
        const b = pos(tg);

        if (on) {
          ctx.shadowColor = "rgba(229, 167, 66, 0.6)";
          ctx.shadowBlur = 8;
          ctx.strokeStyle = "rgba(229, 167, 66, 0.85)";
          ctx.lineWidth = 1.6;
        } else {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = lit ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.09)";
          ctx.lineWidth = 1;
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // 绘制节点
      for (const n of nodes) {
        const { x, y } = pos(n);
        const isHovered = n === hover;
        const isConnected = lit ? lit.has(n) : false;
        const dim = lit && !isConnected;

        ctx.globalAlpha = dim ? 0.16 : 1;

        if (n.kind === "tag") {
          // 标签节点：金环
          if (isHovered || isConnected) {
            ctx.shadowColor = TAG;
            ctx.shadowBlur = 12;
          }

          ctx.beginPath();
          ctx.arc(x, y, isHovered ? n.r + 2 : n.r, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? "rgba(229,167,66,0.18)" : TAG_BG;
          ctx.fill();
          ctx.strokeStyle = TAG;
          ctx.lineWidth = isHovered ? 2.2 : 1.6;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 文字描边垫底保证可读
          ctx.font = font(Math.max(11, Math.min(13, 10 + Math.sqrt(n.count ?? 1) * 0.9)));
          ctx.textAlign = "center";
          ctx.strokeStyle = "#08090c";
          ctx.lineWidth = 4;
          ctx.lineJoin = "round";
          ctx.strokeText(n.label, x, y - n.r - 7);

          ctx.fillStyle = dim ? POST : isHovered ? "#fff" : TAG;
          ctx.fillText(n.label, x, y - n.r - 7);
        } else {
          // 笔记节点：星点
          if (isHovered || (lit && isConnected)) {
            ctx.shadowColor = "rgba(244, 245, 246, 0.9)";
            ctx.shadowBlur = 10;
          }

          ctx.beginPath();
          ctx.arc(x, y, isHovered ? n.r + 2.5 : n.r, 0, Math.PI * 2);
          ctx.fillStyle = isHovered || isConnected ? LIT : POST;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;

      // 悬停气泡提示
      if (hover) {
        const { x, y } = pos(hover);

        if (hover.kind === "post") {
          ctx.font = font(13, 500);
          const title = hover.label;
          const sub = "点击阅读笔记 ↗";
          const tw = Math.max(ctx.measureText(title).width, 110);
          const boxW = tw + 20;
          const boxH = 46;

          let left = x + 14;
          if (left + boxW > w - 10) left = x - boxW - 14;
          let top = y - boxH / 2;
          if (top < 10) top = 10;
          if (top + boxH > h - 10) top = h - boxH - 10;

          ctx.fillStyle = "rgba(10, 11, 15, 0.94)";
          ctx.strokeStyle = "rgba(229, 167, 66, 0.55)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(left, top, boxW, boxH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = LIT;
          ctx.textAlign = "left";
          ctx.font = font(12.5, 600);
          ctx.fillText(title, left + 10, top + 19);

          ctx.fillStyle = TAG;
          ctx.font = font(10.5, 500);
          ctx.fillText(sub, left + 10, top + 35);
        } else if (hover.kind === "tag") {
          const sub = `${hover.count} 篇笔记 · 点击查看归档 ↗`;
          ctx.font = font(11, 500);
          const tw = ctx.measureText(sub).width;
          const boxW = tw + 18;
          const boxH = 26;

          let left = x - boxW / 2;
          if (left < 10) left = 10;
          if (left + boxW > w - 10) left = w - boxW - 10;
          const top = y + hover.r + 10;

          ctx.fillStyle = "rgba(10, 11, 15, 0.94)";
          ctx.strokeStyle = "rgba(229, 167, 66, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(left, top, boxW, boxH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = TAG;
          ctx.textAlign = "center";
          ctx.fillText(sub, left + boxW / 2, top + 17);
        }
      }
    };

    let raf = 0;
    const loop = () => {
      t += 0.012;
      draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) draw();
    else raf = requestAnimationFrame(loop);

    // ---- 5. 交互拾取 ----
    const pick = (e: PointerEvent): Node | null => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let best: Node | null = null;
      let bestD = Infinity;

      for (const n of nodes) {
        const { x, y } = pos(n);
        const d = Math.hypot(x - mx, y - my);
        const hitRadius = n.kind === "tag" ? Math.max(n.r + 10, 22) : Math.max(n.r + 8, 14);
        if (d < hitRadius && d < bestD) {
          best = n;
          bestD = d;
        }
      }
      return best;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;

      hover = pick(e);
      canvas.style.cursor = hover ? "pointer" : "default";
      if (reduced) draw();
    };

    const onLeave = () => {
      hover = null;
      pointerX = -9999;
      pointerY = -9999;
      if (reduced) draw();
    };

    const onClick = (e: PointerEvent) => {
      const n = pick(e);
      if (e.pointerType !== "mouse" && n && n !== hover) {
        hover = n;
        if (reduced) draw();
        return;
      }
      if (n) router.push(n.href);
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerup", onClick);
    window.addEventListener("resize", resize);

    const onVisible = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerup", onClick);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [posts, router]);

  return (
    <canvas
      ref={canvasRef}
      className="kgraph"
      role="img"
      aria-label={`知识图谱：${posts.length} 篇笔记按标签相连`}
    />
  );
}
