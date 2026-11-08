"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  minutes?: number | null;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  orbitSpeed: number;
};

type Stardust = {
  x: number;
  y: number;
  size: number;
  phase: number;
  speed: number;
};

type TooltipState = {
  node: Node;
  x: number;
  y: number;
};

const TAG_COLOR = "#e5a742";
const TAG_CORE = "#241b0d";
const POST_COLOR = "#93c5fd";
const POST_LIT = "#ffffff";

export default function KnowledgeGraph({ posts }: { posts: GraphPost[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !ctx) return;

    // ---- 1. 统计与节点构建 ----
    const tagCounts = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));

    const nodes: Node[] = [];
    const index = new Map<string, Node>();

    const add = (n: Omit<Node, "x" | "y" | "vx" | "vy" | "phase" | "orbitSpeed">) => {
      const a = Math.random() * Math.PI * 2;
      const node: Node = {
        ...n,
        x: Math.cos(a) * 130,
        y: Math.sin(a) * 130,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.003 + Math.random() * 0.004),
      };
      nodes.push(node);
      index.set(node.id, node);
    };

    // 标签核心节点
    tagCounts.forEach((count, tag) => {
      add({
        id: `t:${tag}`,
        kind: "tag",
        label: tag,
        href: `/blog/tags/${encodeURIComponent(tag)}`,
        count,
        r: Math.max(9, Math.min(18, 7 + Math.sqrt(count) * 2.5)),
      });
    });

    // 文章星宿节点
    posts.forEach((p) => {
      add({
        id: `p:${p.href}`,
        kind: "post",
        label: p.title,
        href: p.href,
        minutes: p.minutes,
        r: 3.8,
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

    // 背景微尘星团 (45 颗微星)
    const stardust: Stardust[] = Array.from({ length: 45 }, () => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 500,
      size: 0.8 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.012,
    }));

    // ---- 2. 预平衡力导向（首帧平稳） ----
    const stepPhysics = () => {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = Math.max(dx * dx + dy * dy, 40);
          const f = (a.kind === "tag" && b.kind === "tag" ? 3000 : 620) / d2;
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
        const f = (d - 52) * 0.024;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
        t.vx -= (dx / d) * f * 0.28;
        t.vy -= (dy / d) * f * 0.28;
      }
      for (const n of nodes) {
        n.vx -= n.x * 0.0045;
        n.vy -= n.y * 0.0045;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
      }
    };
    for (let i = 0; i < 460; i++) stepPhysics();

    // ---- 3. 尺寸与分辨率管理 ----
    let w = 0;
    let h = 0;
    let scale = 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const extent = Math.max(...nodes.map((n) => Math.max(Math.abs(n.x), Math.abs(n.y)) + n.r)) || 1;
      const padding = w < 500 ? 64 : 40;
      scale = Math.min(w, h) / 2 / (extent + padding);
    };
    resize();

    const displayFont = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim();
    const monoFont = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let hoverNode: Node | null = null;
    let dragNode: Node | null = null;
    let isDragging = false;
    let pointerX = -9999;
    let pointerY = -9999;
    let t = 0;

    // 坐标推算 + 微浮动 + 鼠标弹性微引力
    const pos = (n: Node) => {
      if (n === dragNode) {
        return {
          x: (pointerX > 0 ? pointerX : w / 2),
          y: (pointerY > 0 ? pointerY : h / 2),
        };
      }

      const drift = reduced ? 0 : n.kind === "post" ? 2.5 : 1.3;
      let bx = w / 2 + n.x * scale + Math.sin(t + n.phase) * drift;
      let by = h / 2 + n.y * scale + Math.cos(t * 0.8 + n.phase) * drift;

      if (!reduced && pointerX > 0 && !dragNode) {
        const dx = pointerX - bx;
        const dy = pointerY - by;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 110) {
          const pull = (1 - dist / 110) * 4.2;
          bx += (dx / dist) * pull;
          by += (dy / dist) * pull;
        }
      }

      return { x: bx, y: by };
    };

    // ---- 4. 渲染核心循环 ----
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // (A) 宇宙背景微光星云
      const bgGlow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.48);
      bgGlow.addColorStop(0, "rgba(229, 167, 66, 0.05)");
      bgGlow.addColorStop(0.65, "rgba(6, 182, 212, 0.015)");
      bgGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // (B) 观测仪同心刻度环 (Observatory Reticles)
      const maxR = Math.min(w, h) * 0.44;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, maxR * 0.45, 0, Math.PI * 2);
      ctx.arc(w / 2, h / 2, maxR * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // (C) 漂浮背景微尘星团
      for (const star of stardust) {
        const sx = w / 2 + star.x + Math.sin(t * star.speed + star.phase) * 14;
        const sy = h / 2 + star.y + Math.cos(t * star.speed + star.phase) * 14;
        const alpha = 0.12 + 0.28 * Math.sin(t * star.speed * 2 + star.phase);

        ctx.fillStyle = `rgba(200, 225, 255, ${Math.max(0, alpha)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // (D) 鼠标光芒透镜
      if (pointerX > 0 && !reduced) {
        const cursorGlow = ctx.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, 130);
        cursorGlow.addColorStop(0, "rgba(229, 167, 66, 0.04)");
        cursorGlow.addColorStop(1, "transparent");
        ctx.fillStyle = cursorGlow;
        ctx.fillRect(0, 0, w, h);
      }

      const activeSet = hoverNode ? new Set([hoverNode, ...neighbors.get(hoverNode)!]) : null;

      // (E) 绘制神经连线 & 流动数据光子 (Photons)
      for (let i = 0; i < links.length; i++) {
        const [p, tg] = links[i];
        const isConnected = activeSet && hoverNode && (p === hoverNode || tg === hoverNode);
        const a = pos(p);
        const b = pos(tg);

        if (isConnected) {
          // 激活光束：多重金光泛光通道
          ctx.shadowColor = "rgba(229, 167, 66, 0.8)";
          ctx.shadowBlur = 10;
          ctx.strokeStyle = "rgba(229, 167, 66, 0.88)";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          // 闲置状态：低阻抗晶体发丝线
          ctx.strokeStyle = activeSet ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.07)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        // 光纤数据流：沿连线穿梭的光子微粒
        if (!reduced && (!activeSet || isConnected)) {
          const photonSpeed = 0.006 + (i % 5) * 0.002;
          const progress = ((t * photonSpeed * 60 + i * 0.17) % 1.0);
          const px = a.x + (b.x - a.x) * progress;
          const py = a.y + (b.y - a.y) * progress;

          ctx.fillStyle = isConnected ? "#ffffff" : "rgba(229, 167, 66, 0.65)";
          ctx.shadowColor = isConnected ? "rgba(255, 255, 255, 0.9)" : "rgba(229, 167, 66, 0.6)";
          ctx.shadowBlur = isConnected ? 6 : 3;
          ctx.beginPath();
          ctx.arc(px, py, isConnected ? 2 : 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // (F) 绘制星体节点
      for (const n of nodes) {
        const { x, y } = pos(n);
        const isHovered = n === hoverNode;
        const isLit = activeSet ? activeSet.has(n) : false;
        const isDim = activeSet && !isLit;

        ctx.globalAlpha = isDim ? 0.14 : 1;

        if (n.kind === "tag") {
          // --- 标签星体（引力枢纽） ---
          const glowR = n.r * (isHovered ? 2.6 : 2.1);

          // 1. 外部恒星光冕
          const corona = ctx.createRadialGradient(x, y, n.r * 0.4, x, y, glowR);
          corona.addColorStop(0, isHovered ? "rgba(229, 167, 66, 0.45)" : "rgba(229, 167, 66, 0.18)");
          corona.addColorStop(1, "transparent");
          ctx.fillStyle = corona;
          ctx.beginPath();
          ctx.arc(x, y, glowR, 0, Math.PI * 2);
          ctx.fill();

          // 2. 旋转轨道虚线环 (Rotating Pulsar Ring)
          if (!reduced) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(t * n.orbitSpeed * 10);
            ctx.strokeStyle = isHovered ? "rgba(229, 167, 66, 0.8)" : "rgba(229, 167, 66, 0.35)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([2, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, n.r + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // 3. 实体行星核
          ctx.shadowColor = TAG_COLOR;
          ctx.shadowBlur = isHovered ? 16 : 8;
          ctx.beginPath();
          ctx.arc(x, y, isHovered ? n.r + 2 : n.r, 0, Math.PI * 2);
          ctx.fillStyle = TAG_CORE;
          ctx.fill();
          ctx.strokeStyle = isHovered ? "#fff" : TAG_COLOR;
          ctx.lineWidth = isHovered ? 2.2 : 1.6;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 4. 行星中心闪烁信号标
          ctx.fillStyle = isHovered ? "#ffffff" : TAG_COLOR;
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // 5. 悬浮磨砂标签胶囊 (Frosted Tag Capsule)
          const countStr = `${n.count ?? 1}`;
          ctx.font = `600 11px ${monoFont}, monospace`;
          const textW = ctx.measureText(n.label).width;
          const countW = ctx.measureText(countStr).width;
          const capW = textW + countW + 20;
          const capH = 22;
          const capX = x - capW / 2;
          const capY = y - n.r - 20;

          ctx.fillStyle = "rgba(10, 12, 16, 0.88)";
          ctx.strokeStyle = isHovered ? "rgba(229, 167, 66, 0.85)" : "rgba(229, 167, 66, 0.22)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(capX, capY, capW, capH, 4);
          ctx.fill();
          ctx.stroke();

          // 标签文字
          ctx.textAlign = "left";
          ctx.fillStyle = isHovered ? "#fff" : TAG_COLOR;
          ctx.fillText(n.label, capX + 8, capY + 15);

          // 计数徽章
          ctx.fillStyle = isHovered ? TAG_COLOR : "rgba(255, 255, 255, 0.4)";
          ctx.fillText(countStr, capX + textW + 12, capY + 15);
        } else {
          // --- 笔记星宿（数据晶体） ---
          const pulse = reduced ? 1 : 0.7 + 0.3 * Math.sin(t * 1.8 + n.phase);
          const starR = isHovered ? n.r + 3 : n.r * pulse;

          // 星芒泛光
          if (isHovered || isLit) {
            ctx.shadowColor = "rgba(147, 197, 253, 0.95)";
            ctx.shadowBlur = isHovered ? 16 : 8;
            ctx.fillStyle = POST_LIT;
          } else {
            ctx.shadowColor = "rgba(147, 197, 253, 0.3)";
            ctx.shadowBlur = 4;
            ctx.fillStyle = POST_COLOR;
          }

          ctx.beginPath();
          ctx.arc(x, y, starR, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // 极亮星芒十字（高亮时展示）
          if (isHovered && !reduced) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - starR * 2.5, y);
            ctx.lineTo(x + starR * 2.5, y);
            ctx.moveTo(x, y - starR * 2.5);
            ctx.lineTo(x, y + starR * 2.5);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = () => {
      t += 0.016;

      // 拖拽物理动力学：被拖节点强行跟随鼠标，释放后平滑回到网格
      if (dragNode) {
        dragNode.vx = 0;
        dragNode.vy = 0;
        dragNode.x = (pointerX - w / 2) / scale;
        dragNode.y = (pointerY - h / 2) / scale;
      }

      draw();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) draw();
    else raf = requestAnimationFrame(loop);

    // ---- 5. 触控与鼠标物理拾取 ----
    const pickNode = (clientX: number, clientY: number): Node | null => {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      let best: Node | null = null;
      let bestDist = Infinity;

      for (const n of nodes) {
        const { x, y } = pos(n);
        const d = Math.hypot(x - mx, y - my);
        const hitRadius = n.kind === "tag" ? Math.max(n.r + 14, 26) : Math.max(n.r + 10, 16);
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

      if (!isDragging) {
        const hit = pickNode(e.clientX, e.clientY);
        hoverNode = hit;
        canvas.style.cursor = hit ? "pointer" : "default";

        if (hit) {
          const { x, y } = pos(hit);
          setTooltip({ node: hit, x, y });
        } else {
          setTooltip(null);
        }
      }
    };

    let dragStartX = 0;
    let dragStartY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      const hit = pickNode(e.clientX, e.clientY);
      if (hit) {
        dragNode = hit;
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging && dragNode) {
        canvas.releasePointerCapture(e.pointerId);
        const dragDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
        // 移动距离小于 6px 视为点击跳转；大于 6px 视为拖拽模拟，不跳转
        if (dragDist < 6) {
          router.push(dragNode.href);
        }
      }
      isDragging = false;
      dragNode = null;
    };

    const handlePointerLeave = () => {
      hoverNode = null;
      setTooltip(null);
      pointerX = -9999;
      pointerY = -9999;
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("resize", resize);

    const onVisible = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduced) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [posts, router]);

  return (
    <div ref={containerRef} className={styles.graphWrap}>
      {/* 观测台取景框角标 */}
      <span className={styles.reticleTL} aria-hidden="true" />
      <span className={styles.reticleTR} aria-hidden="true" />
      <span className={styles.reticleBL} aria-hidden="true" />
      <span className={styles.reticleBR} aria-hidden="true" />

      {/* 顶部遥测状态 */}
      <div className={styles.graphHudTop}>
        <span className={styles.graphHudDot} />
        <span>KNOWLEDGE MATRIX // {posts.length} NODES</span>
      </div>

      {/* 底部操作指引 */}
      <div className={styles.graphHudBottom}>
        <span>DRAG TO SIMULATE · CLICK TO ENTER</span>
      </div>

      {/* 核心画布 */}
      <canvas
        ref={canvasRef}
        className={styles.graphCanvas}
        role="img"
        aria-label={`知识图谱：${posts.length} 篇笔记与主题拓扑`}
      />

      {/* 毛玻璃 HUD 悬浮指示卡 */}
      {tooltip && (
        <div
          className={styles.graphTooltip}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: `translate(${tooltip.x > 320 ? "-105%" : "15px"}, ${
              tooltip.y > 340 ? "-105%" : "15px"
            })`,
          }}
        >
          {tooltip.node.kind === "post" ? (
            <>
              <div className={styles.tooltipBadge}>NOTE // 技术笔记</div>
              <div className={styles.tooltipTitle}>{tooltip.node.label}</div>
              <div className={styles.tooltipMeta}>
                {tooltip.node.minutes ? (
                  <span>{tooltip.node.minutes} min read</span>
                ) : (
                  <span>全文字</span>
                )}
                <span className={styles.tooltipAction}>点击阅读 ➔</span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.tooltipBadge}>CLUSTER // 知识领域</div>
              <div className={styles.tooltipTitle}>{tooltip.node.label}</div>
              <div className={styles.tooltipMeta}>
                <span>{tooltip.node.count} 篇归档笔记</span>
                <span className={styles.tooltipAction}>查看标签 ➔</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
