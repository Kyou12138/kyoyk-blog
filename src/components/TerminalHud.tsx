"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type LogEntry = {
  text: string;
  type?: "info" | "success" | "warn" | "cmd";
};

export default function TerminalHud() {
  const [open, setOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [ping, setPing] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: "KYTHRON SYSTEM CORE v2.4 // ONLINE", type: "info" },
    { text: "Node: Huawei ECS (cn-south-1) · Argo Tunnel Active", type: "success" },
    { text: "Type 'help' for available commands.", type: "info" },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 1. 实时 FPS 监控
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId = 0;

    const measure = (now: number) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 2. 测算实时 API 往返延迟
  useEffect(() => {
    let active = true;
    const testPing = async () => {
      const start = performance.now();
      try {
        await fetch("/api/search-index", { method: "HEAD", cache: "no-store" });
        if (active) setPing(Math.round(performance.now() - start));
      } catch {
        if (active) setPing(null);
      }
    };

    testPing();
    const interval = setInterval(testPing, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // 3. 快捷键 ` 或 ~ 切换终端
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, logs]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    const newLogs: LogEntry[] = [...logs, { text: `> ${cmd}`, type: "cmd" }];

    switch (cmd) {
      case "help":
        newLogs.push(
          { text: "Available commands:", type: "info" },
          { text: "  status    - View cloud node & runtime telemetry", type: "info" },
          { text: "  ping      - Measure edge latency to Huawei ECS", type: "info" },
          { text: "  stack     - Tech architecture summary", type: "info" },
          { text: "  posts     - Jump to latest notes", type: "info" },
          { text: "  clear     - Clear terminal logs", type: "info" },
          { text: "  exit      - Close HUD terminal", type: "info" }
        );
        break;
      case "status":
        newLogs.push(
          { text: `Host: kythron.com (Huawei Cloud ECS 2vCPU / 2GB)`, type: "success" },
          { text: `Edge: Cloudflare Zero Trust Tunnel (QUIC protocol)`, type: "info" },
          { text: `Renderer: Next.js 15 Standalone · FPS: ${fps}`, type: "info" },
          { text: `Latency: ${ping !== null ? `${ping}ms` : "measuring..."}`, type: "info" }
        );
        break;
      case "ping":
        newLogs.push({ text: `Current Edge Latency: ${ping ?? "N/A"}ms`, type: "success" });
        break;
      case "stack":
        newLogs.push(
          { text: "Architecture: Next.js 15 + PostgreSQL 17 + Docker", type: "info" },
          { text: "Security: Scrypt NFKC + HMAC-SHA256 HttpOnly Cookie", type: "info" },
          { text: "Encryption: AES-256-GCM private note sealing", type: "info" }
        );
        break;
      case "posts":
        window.location.href = "/blog";
        break;
      case "clear":
        setLogs([]);
        setInput("");
        return;
      case "exit":
        setOpen(false);
        break;
      default:
        newLogs.push({ text: `command not found: ${cmd}. Type 'help' for manual.`, type: "warn" });
    }

    setLogs(newLogs);
    setInput("");
  };

  return (
    <aside className="terminal-hud" aria-label="极客系统终端">
      {/* 折叠常驻微型状态指示器 */}
      {!open && (
        <button
          type="button"
          className="hud-pill"
          onClick={() => setOpen(true)}
          title="点击或按 ` 键打开极客 HUD"
        >
          <span className="hud-pill__dot" />
          <span className="hud-pill__label">SYS</span>
          <span className="hud-pill__fps">{fps} FPS</span>
          {ping !== null && <span className="hud-pill__ping">{ping}ms</span>}
        </button>
      )}

      {/* 展开的 HUD 终端面板 */}
      {open && (
        <div className="hud-window">
          <div className="hud-header">
            <div className="hud-header__dots">
              <span className="hud-dot hud-dot--red" onClick={() => setOpen(false)} />
              <span className="hud-dot hud-dot--yellow" />
              <span className="hud-dot hud-dot--green" />
            </div>
            <div className="hud-header__title">KYTHRON-HUD // SHELL</div>
            <button
              type="button"
              className="hud-header__close"
              onClick={() => setOpen(false)}
              aria-label="关闭终端"
            >
              ✕
            </button>
          </div>

          <div className="hud-body">
            {logs.map((log, idx) => (
              <div key={idx} className={`hud-line hud-line--${log.type ?? "info"}`}>
                {log.text}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          <form className="hud-input-row" onSubmit={handleCommand}>
            <span className="hud-prompt">❯</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type 'help' or command..."
              className="hud-input"
              spellCheck={false}
              autoComplete="off"
            />
          </form>
        </div>
      )}
    </aside>
  );
}
