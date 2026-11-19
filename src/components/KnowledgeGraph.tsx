"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatDateDot } from "@/lib/format";
import styles from "./home-hero.module.css";

export type GraphPost = {
  title: string;
  href: string;
  tags: string[];
  publishedAt?: string | null;
  minutes?: number | null;
};

type Node = {
  id: string;
  kind: "tag" | "post";
  label: string;
  href: string;
  count?: number;
  rank?: number;
  dateStr?: string;
  minutes?: number | null;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  orbitSpeed: number;
  visAlpha: number;
};

type TooltipState = {
  node: Node;
  x: number;
  y: number;
  cw: number;
  ch: number;
};

const rgbTriple = (hex: string): string => {
  const raw = hex.replace("#", "").trim();
  const full = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw;
  const n = Number.parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

// 画布用不了 CSS 变量：切换皮肤时重读一次再重绘，布局与物理状态保持不变。
const readPalette = () => {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const ink = token("--text", "#141311");
  const paper = token("--surface", "#faf8f4");
  const accent = token("--primary", "#d13b27");
  return {
    ink,
    inkSoft: token("--text-secondary", "#3d3a34"),
    paper,
    accent,
    inkRgb: rgbTriple(ink),
    paperRgb: rgbTriple(paper),
    accentRgb: rgbTriple(accent),
  };
};

type Palette = ReturnType<typeof readPalette>;

export default function KnowledgeGraph({
  posts,
  tagCount,
}: {
  posts: GraphPost[];
  tagCount: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !ctx) return;

    let P: Palette = readPalette();

    // 1. 构建拓扑节点（黄金角螺旋初值，保证每次渲染平面展开均匀无缠结）
    const tagCounts = new Map<string, number>();
    posts.forEach((p) =>
      p.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)),
    );

    const sortedTags = [...tagCounts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );

    const nodes: Node[] = [];
    const index = new Map<string, Node>();
    let seedIdx = 0;

    const add = (
      n: Omit<Node, "x" | "y" | "vx" | "vy" | "phase" | "orbitSpeed" | "visAlpha">,
    ) => {
      const i = seedIdx++;
      const angle = i * 2.39996323;
      const rad = Math.sqrt(i + 1) * 22;
      const node: Node = {
        ...n,
        x: Math.cos(angle) * rad,
        y: Math.sin(angle) * rad,
        vx: 0,
        vy: 0,
        phase: (i * 1.71) % (Math.PI * 2),
        orbitSpeed: (i % 2 === 0 ? 1 : -1) * (0.0025 + (i % 5) * 0.0007),
        visAlpha: 1,
      };
      nodes.push(node);
      index.set(node.id, node);
    };

    sortedTags.forEach(([tag, count], rank) => {
      add({
        id: `t:${tag}`,
        kind: "tag",
        label: tag,
        href: `/blog/tags/${encodeURIComponent(tag)}`,
        count,
        rank,
        r: Math.max(7.5, Math.min(15.5, 6.2 + Math.sqrt(count) * 2.2)),
      });
    });

    posts.forEach((p) => {
      add({
        id: `p:${p.href}`,
        kind: "post",
        label: p.title,
        href: p.href,
        dateStr: formatDateDot(p.publishedAt).slice(0, 7),
        minutes: p.minutes,
        r: 3.4,
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

    // 2. 力导向求解器（首帧预平衡 + 拖拽实时弹簧牵引）
    const stepPhysics = (alpha = 1, pinned: Node | null = null) => {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = Math.max(dx * dx + dy * dy, 48);
          const repulse = a.kind === "tag" && b.kind === "tag" ? 3100 : 580;
          const f = (repulse / d2) * alpha;
          const d = Math.sqrt(d2);
          if (a !== pinned) {
            a.vx += (dx / d) * f;
            a.vy += (dy / d) * f;
          }
          if (b !== pinned) {
            b.vx -= (dx / d) * f;
            b.vy -= (dy / d) * f;
          }
        }
      }
      for (const [p, tg] of links) {
        const dx = tg.x - p.x;
        const dy = tg.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - 48) * 0.028 * alpha;
        if (p !== pinned) {
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        if (tg !== pinned) {
          tg.vx -= (dx / d) * f * 0.32;
          tg.vy -= (dy / d) * f * 0.32;
        }
      }
      for (const n of nodes) {
        if (n === pinned) continue;
        n.vx -= n.x * 0.005 * alpha;
        n.vy -= n.y * 0.005 * alpha;
        n.vx *= 0.8;
        n.vy *= 0.8;
        n.x += n.vx;
        n.y += n.vy;
      }
    };

    for (let i = 0; i < 380; i++) stepPhysics(1, null);

    // 3. 视口与高清 DPR 校准
    let w = 0;
    let h = 0;
    let scale = 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const extent =
        Math.max(...nodes.map((n) => Math.max(Math.abs(n.x), Math.abs(n.y)) + n.r)) || 1;
      const padding = w < 480 ? 48 : 38;
      scale = Math.min(w, h) / 2 / (extent + padding);
    };
    resize();

    const monoFont =
      getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
      "monospace";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let hoverNode: Node | null = null;
    let dragNode: Node | null = null;
    let isDragging = false;
    let simEnergy = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let t = 0;

    const pos = (n: Node) => {
      if (n === dragNode && pointerX > -999) {
        return { x: pointerX, y: pointerY };
      }
      const drift = reduced ? 0 : n.kind === "post" ? 1.8 : 0.95;
      let bx = w / 2 + n.x * scale + Math.sin(t + n.phase) * drift;
      let by = h / 2 + n.y * scale + Math.cos(t * 0.82 + n.phase) * drift;

      if (!reduced && pointerX > 0 && !dragNode) {
        const dx = pointerX - bx;
        const dy = pointerY - by;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 96) {
          const pull = (1 - dist / 96) * 3.2;
          bx += (dx / dist) * pull;
          by += (dy / dist) * pull;
        }
      }
      return { x: bx, y: by };
    };

    // 4. 版画测绘级渲染循环
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.45;

      // (A) 暖棉纸心微晕与十字基准线
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      wash.addColorStop(0, `rgba(${P.accentRgb}, 0.032)`);
      wash.addColorStop(0.7, `rgba(${P.inkRgb}, 0.012)`);
      wash.addColorStop(1, "transparent");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = `rgba(${P.inkRgb}, 0.05)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - maxR * 0.96, cy);
      ctx.lineTo(cx + maxR * 0.96, cy);
      ctx.moveTo(cx, cy - maxR * 0.96);
      ctx.lineTo(cx, cy + maxR * 0.96);
      ctx.stroke();

      // (B) 精密罗盘刻度环与内层测绘虚线圈
      ctx.strokeStyle = `rgba(${P.inkRgb}, 0.075)`;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.88, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([2, 6]);
      ctx.strokeStyle = `rgba(${P.inkRgb}, 0.065)`;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * 0.48, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 罗盘度数短刻线（每 15° 一刻，每 45° 主刻）
      ctx.strokeStyle = `rgba(${P.inkRgb}, 0.14)`;
      ctx.beginPath();
      for (let deg = 0; deg < 360; deg += 15) {
        const rad = (deg * Math.PI) / 180;
        const rOuter = maxR * 0.88;
        const rInner = rOuter - (deg % 45 === 0 ? 6 : 3);
        ctx.moveTo(cx + Math.cos(rad) * rInner, cy + Math.sin(rad) * rInner);
        ctx.lineTo(cx + Math.cos(rad) * rOuter, cy + Math.sin(rad) * rOuter);
      }
      ctx.stroke();

      const focusNode = dragNode ?? hoverNode;
      const activeSet = focusNode ? new Set([focusNode, ...neighbors.get(focusNode)!]) : null;

      // 平滑插值每个节点的视觉透明度
      for (const n of nodes) {
        const target = !activeSet || activeSet.has(n) ? 1 : 0.14;
        n.visAlpha += (target - n.visAlpha) * (reduced ? 1 : 0.18);
      }

      // (C) 墨丝连线与朱砂脉冲微粒
      for (let i = 0; i < links.length; i++) {
        const [p, tg] = links[i];
        const isConnected = Boolean(focusNode && (p === focusNode || tg === focusNode));
        const a = pos(p);
        const b = pos(tg);

        if (isConnected) {
          ctx.strokeStyle = `rgba(${P.accentRgb}, 0.78)`;
          ctx.lineWidth = 1.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        } else {
          const idleAlpha = activeSet ? 0.035 : 0.125;
          ctx.strokeStyle = `rgba(${P.inkRgb}, ${idleAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        // 墨脉信号微粒（激活时全部连线脉冲，静默时仅稀疏采样保持克制）
        if (!reduced && (isConnected || (!activeSet && i % 4 === 0))) {
          const speed = isConnected ? 0.011 : 0.0045;
          const progress = (t * speed * 60 + i * 0.21) % 1;
          const px = a.x + (b.x - a.x) * progress;
          const py = a.y + (b.y - a.y) * progress;

          ctx.fillStyle = isConnected ? P.accent : `rgba(${P.accentRgb}, 0.42)`;
          ctx.beginPath();
          ctx.arc(px, py, isConnected ? 2 : 1.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // (D) 先绘文章节点（墨点 + 纸白留空光圈）
      for (const n of nodes) {
        if (n.kind !== "post") continue;
        const { x, y } = pos(n);
        const isHovered = n === focusNode;
        const isLit = activeSet ? activeSet.has(n) : false;

        ctx.globalAlpha = n.visAlpha;

        // 纸底留白断线环（制图法留空）
        ctx.fillStyle = P.paper;
        ctx.beginPath();
        ctx.arc(x, y, n.r + 2.2, 0, Math.PI * 2);
        ctx.fill();

        // 核心墨点 / 朱砂靶点
        const dotR = isHovered ? n.r + 1.8 : isLit ? n.r + 0.7 : n.r;
        ctx.fillStyle = isHovered || isLit ? P.accent : P.inkSoft;
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fill();

        // 悬停精密游标外环与十字丝
        if (isHovered) {
          ctx.strokeStyle = P.accent;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, dotR + 4.5, 0, Math.PI * 2);
          ctx.moveTo(x - dotR - 8, y);
          ctx.lineTo(x - dotR - 2.5, y);
          ctx.moveTo(x + dotR + 2.5, y);
          ctx.lineTo(x + dotR + 8, y);
          ctx.moveTo(x, y - dotR - 8);
          ctx.lineTo(x, y - dotR - 2.5);
          ctx.moveTo(x, y + dotR + 2.5);
          ctx.lineTo(x, y + dotR + 8);
          ctx.stroke();
        }
      }

      // (E) 再绘标签枢纽（保证标签牌在最上层清晰可读，并用包围盒避让杜绝窄屏重叠）
      const maxVisibleLabels = w < 480 ? 8 : 13;
      const tagCoords = nodes
        .filter((n) => n.kind === "tag")
        .map((n) => ({ node: n, ...pos(n) }));
      const placedPills: Array<{ x1: number; y1: number; x2: number; y2: number }> = [
        { x1: 0, y1: 0, x2: 88, y2: 28 },
        { x1: w - 82, y1: h - 28, x2: w, y2: h },
      ];

      for (const { node: n, x, y } of tagCoords) {
        const isHovered = n === focusNode;
        const isLit = activeSet ? activeSet.has(n) : false;

        ctx.globalAlpha = n.visAlpha;

        // 游标外虚线环（仅对高频枢纽或激活枢纽绘制，克制精致）
        if (!reduced && (isHovered || isLit || (n.rank ?? 99) < 6)) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(t * n.orbitSpeed * 12);
          ctx.strokeStyle =
            isHovered || isLit ? `rgba(${P.accentRgb}, 0.55)` : `rgba(${P.inkRgb}, 0.18)`;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, n.r + 4.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // 实体印章圆环
        const ringR = isHovered ? n.r + 1.5 : n.r;
        ctx.fillStyle = isHovered ? P.accent : P.paper;
        ctx.strokeStyle = isHovered || isLit ? P.accent : P.ink;
        ctx.lineWidth = isHovered ? 1.8 : 1.35;
        ctx.beginPath();
        ctx.arc(x, y, ringR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 中心针孔墨心
        ctx.fillStyle = isHovered ? P.paper : isLit ? P.accent : P.ink;
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fill();

        // 标签铭牌：桌面展示前 13 大标签，窄屏前 8 大标签；碰撞时按权重退让，悬停始终优先
        const showLabel =
          isHovered || isLit || (!activeSet && (n.rank ?? 99) < maxVisibleLabels);

        if (showLabel) {
          const countStr = `${n.count ?? 1}`;
          ctx.font = `500 10.5px ${monoFont}`;
          const textW = ctx.measureText(n.label).width;
          const countW = ctx.measureText(countStr).width;
          const capW = textW + countW + 17;
          const capH = 20;
          const capX = Math.max(8, Math.min(w - capW - 8, x - capW / 2));
          const capY = Math.max(8, y - ringR - 23);
          const box = { x1: capX - 3, y1: capY - 2, x2: capX + capW + 3, y2: capY + capH + 2 };

          const collidesPill = placedPills.some(
            (b) => box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1,
          );
          const collidesOtherRing = tagCoords.some(
            (o) =>
              o.node !== n &&
              box.x1 < o.x + o.node.r + 2 &&
              box.x2 > o.x - o.node.r - 2 &&
              box.y1 < o.y + o.node.r + 2 &&
              box.y2 > o.y - o.node.r - 2,
          );

          if (isHovered || (!collidesPill && !collidesOtherRing)) {
            placedPills.push(box);

            ctx.fillStyle = isHovered ? P.ink : `rgba(${P.paperRgb}, 0.94)`;
            ctx.strokeStyle = isHovered
              ? P.ink
              : isLit
                ? `rgba(${P.accentRgb}, 0.55)`
                : `rgba(${P.inkRgb}, 0.18)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(capX, capY, capW, capH, 2);
            ctx.fill();
            ctx.stroke();

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = isHovered ? P.paper : P.ink;
            ctx.fillText(n.label, capX + 6.5, capY + capH / 2 + 0.5);

            ctx.fillStyle = isHovered ? `rgba(${P.paperRgb}, 0.72)` : P.accent;
            ctx.fillText(countStr, capX + textW + 11, capY + capH / 2 + 0.5);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = () => {
      t += 0.016;

      if (dragNode && pointerX > -999) {
        dragNode.vx = 0;
        dragNode.vy = 0;
        dragNode.x = (pointerX - w / 2) / scale;
        dragNode.y = (pointerY - h / 2) / scale;
        simEnergy = 0.65;
      }

      if (simEnergy > 0.01) {
        stepPhysics(simEnergy, dragNode);
        if (!dragNode) simEnergy *= 0.93;
      }

      draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) draw();
    else raf = requestAnimationFrame(loop);

    // 5. 指针交互拾取
    const pickNode = (clientX: number, clientY: number): Node | null => {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      let best: Node | null = null;
      let bestDist = Infinity;

      for (const n of nodes) {
        const { x, y } = pos(n);
        const d = Math.hypot(x - mx, y - my);
        const hitRadius = n.kind === "tag" ? Math.max(n.r + 12, 24) : Math.max(n.r + 9, 15);
        if (d < hitRadius && d < bestDist) {
          best = n;
          bestDist = d;
        }
      }
      return best;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;

      if (isDragging && dragNode) {
        canvas.style.cursor = "grabbing";
        setTooltip({ node: dragNode, x: pointerX, y: pointerY, cw: w, ch: h });
        if (reduced) draw();
        return;
      }

      const hit = pickNode(e.clientX, e.clientY);
      hoverNode = hit;
      canvas.style.cursor = hit ? "grab" : "default";

      if (hit) {
        const { x, y } = pos(hit);
        setTooltip({ node: hit, x, y, cw: w, ch: h });
      } else {
        setTooltip(null);
      }
      if (reduced) draw();
    };

    let dragStartX = 0;
    let dragStartY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      const hit = pickNode(e.clientX, e.clientY);
      if (hit) {
        const rect = canvas.getBoundingClientRect();
        pointerX = e.clientX - rect.left;
        pointerY = e.clientY - rect.top;
        dragNode = hit;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        canvas.style.cursor = "grabbing";
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging && dragNode) {
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
        const dragDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
        const targetHref = dragNode.href;
        isDragging = false;
        dragNode = null;
        canvas.style.cursor = hoverNode ? "grab" : "default";
        if (dragDist < 6) {
          router.push(targetHref);
        }
      }
    };

    const handlePointerLeave = () => {
      if (isDragging) return;
      hoverNode = null;
      setTooltip(null);
      pointerX = -9999;
      pointerY = -9999;
      if (reduced) draw();
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resize);

    let inViewport = true;
    const updateLoop = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && inViewport && !reduced) {
        raf = requestAnimationFrame(loop);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inViewport = Boolean(entries[0]?.isIntersecting);
        updateLoop();
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    const onVisible = () => updateLoop();
    document.addEventListener("visibilitychange", onVisible);

    const skinObserver = new MutationObserver(() => {
      P = readPalette();
      draw();
    });
    skinObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-skin"],
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      skinObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [posts, router]);

  const flipX = tooltip ? tooltip.x > tooltip.cw * 0.52 : false;
  const flipY = tooltip ? tooltip.y > tooltip.ch * 0.62 : false;

  return (
    <div ref={containerRef} className={styles.graphWrap}>
      <span className={styles.reticleTL} aria-hidden="true" />
      <span className={styles.reticleTR} aria-hidden="true" />
      <span className={styles.reticleBL} aria-hidden="true" />
      <span className={styles.reticleBR} aria-hidden="true" />

      <div className={styles.plateMarkTop} aria-hidden="true">
        <span className={styles.plateDot} />
        <span>FIG. 01</span>
      </div>

      <div className={styles.plateMarkBottom} aria-hidden="true">
        <span>
          {String(posts.length).padStart(2, "0")} · {String(tagCount).padStart(2, "0")}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        className={styles.graphCanvas}
        role="img"
        aria-label={`${posts.length} 篇笔记与 ${tagCount} 个标签的知识拓扑`}
      />

      {tooltip && (
        <div
          className={styles.graphTooltip}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: `translate(${flipX ? "calc(-100% - 12px)" : "12px"}, ${
              flipY ? "calc(-100% - 12px)" : "12px"
            })`,
          }}
        >
          <div className={styles.tooltipTitle}>
            {tooltip.node.kind === "tag" ? `#${tooltip.node.label}` : tooltip.node.label}
          </div>
          <div className={styles.tooltipMeta}>
            {tooltip.node.kind === "post" ? (
              <span>
                {[
                  tooltip.node.dateStr,
                  tooltip.node.minutes ? `${tooltip.node.minutes}m` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            ) : (
              <span>{tooltip.node.count} 篇 · 查看标签</span>
            )}
            <span aria-hidden="true">↗</span>
          </div>
        </div>
      )}
    </div>
  );
}
