"use client";

import Link from "next/link";
import { useState } from "react";

export default function AiSystemCortex() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <div className="ai-cortex" aria-label="AI 智能体系统架构拓扑">
      <div className="ai-cortex__header">
        <span className="ai-cortex__status-dot" />
        <span className="ai-cortex__title">AGENTIC RUNTIME // SYSTEM ARCHITECTURE</span>
        <span className="ai-cortex__tag">LLM as CPU</span>
      </div>

      <div className="ai-cortex__schematic">
        {/* SVG 总线与连线 */}
        <svg className="ai-cortex__svg" viewBox="0 0 420 320" fill="none" aria-hidden="true">
          {/* 背景精密点阵 */}
          <pattern id="cortex-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.06)" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#cortex-grid)" />

          {/* 总线连接线 */}
          <path
            d="M 210 120 L 210 50 M 210 180 L 210 260 M 130 150 L 50 150 M 290 150 L 370 150"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* 动态信号流动脉冲 */}
          <circle cx="210" cy="85" r="2.5" fill="#e5a742" className="cortex-pulse-v" />
          <circle cx="210" cy="220" r="2.5" fill="#06b6d4" className="cortex-pulse-v" />
          <circle cx="90" cy="150" r="2.5" fill="#10b981" className="cortex-pulse-h" />
          <circle cx="330" cy="150" r="2.5" fill="#e5a742" className="cortex-pulse-h" />
        </svg>

        {/* 核心节点：LLM Reasoning Core (CPU) */}
        <div
          className={`cortex-node cortex-node--cpu ${activeNode === "cpu" ? "is-active" : ""}`}
          onMouseEnter={() => setActiveNode("cpu")}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="cortex-node__badge">REASONING CORE</div>
          <div className="cortex-node__name">LLM Engine (CPU)</div>
          <div className="cortex-node__desc">Intent • Plan • Route</div>
          <div className="cortex-node__stat">Latency: 24ms • 60 tps</div>
        </div>

        {/* 上方节点：Context Window (L1/L2 Cache) */}
        <div
          className={`cortex-node cortex-node--top ${activeNode === "cache" ? "is-active" : ""}`}
          onMouseEnter={() => setActiveNode("cache")}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="cortex-node__label">CONTEXT WINDOW (CACHE)</div>
          <div className="cortex-node__meta">128K Token Horizon • Sliding Compaction</div>
        </div>

        {/* 左侧节点：MCP Tools & Peripherals (I/O Bus) */}
        <Link
          href="/proj"
          className={`cortex-node cortex-node--left ${activeNode === "io" ? "is-active" : ""}`}
          onMouseEnter={() => setActiveNode("io")}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="cortex-node__label">TOOL I/O (PERIPHERALS)</div>
          <div className="cortex-node__name">MCP Protocols & Tools</div>
          <div className="cortex-node__meta">Postgres • Web Search • Bash ↗</div>
        </Link>

        {/* 右侧节点：Knowledge Vault (RAM / Vector Cortex) - 点击直接跳入知识库 */}
        <Link
          href="/blog"
          className={`cortex-node cortex-node--right cortex-node--highlight ${
            activeNode === "brain" ? "is-active" : ""
          }`}
          onMouseEnter={() => setActiveNode("brain")}
          onMouseLeave={() => setActiveNode(null)}
          title="点击进入全栈知识库"
        >
          <div className="cortex-node__label cortex-node__label--gold">KNOWLEDGE VAULT (RAM)</div>
          <div className="cortex-node__name">个人 AI 知识库 ↗</div>
          <div className="cortex-node__meta">31 篇架构笔记 • RAG Ready</div>
          <span className="cortex-node__action">探索大脑知识库 →</span>
        </Link>

        {/* 下方节点：Persistence & Memory (Storage) */}
        <div
          className={`cortex-node cortex-node--bottom ${activeNode === "storage" ? "is-active" : ""}`}
          onMouseEnter={() => setActiveNode("storage")}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div className="cortex-node__label">LONG-TERM MEMORY (STORAGE)</div>
          <div className="cortex-node__meta">PostgreSQL 17 • Embeddings • Observational Logs</div>
        </div>
      </div>

      <div className="ai-cortex__footer">
        <span className="ai-cortex__hint">
          💡 点击 <strong>知识库 (RAM)</strong> 节点直达结构化全栈笔记
        </span>
      </div>
    </div>
  );
}
